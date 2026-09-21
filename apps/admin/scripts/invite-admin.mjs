/**
 * 최초/추가 관리자 초대 CLI. 소유자가 로컬에서 직접 실행한다.
 *
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<key> \
 *   node scripts/invite-admin.mjs --email admin@example.com --role super_admin --env development
 *
 * 초대 메일의 수락 링크는 Supabase Site URL로 향한다. 배포된 Backoffice가 아직
 * 초대 수락을 처리하지 못하면 --redirect-to 로 로컬 확인용 주소를 지정한다:
 *
 *   node scripts/invite-admin.mjs --email ... --role ... --env development \
 *     --redirect-to http://127.0.0.1:3000/auth/confirm
 *
 * 규칙:
 * - service_role 키는 실행 시점 환경에서만 읽는다. repo·이미지·로그에 남기지 않는다.
 * - 역할은 super_admin|operator만 허용한다 (viewer 없음, 0층 계약).
 * - 역할은 auth user의 app_metadata에만 기록한다 (본인 승격 방지).
 * - --env는 대상 Supabase가 어느 환경 것인지 사람이 한 번 더 확인하는 용도다.
 */

import { createClient } from "@supabase/supabase-js";

const VALID_ROLES = new Set(["super_admin", "operator"]);
const VALID_ENVS = new Set(["development", "production"]);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    // pnpm/npm이 전달하는 "--" 구분자는 건너뛴다.
    if (token === "--") continue;
    if (token.startsWith("--")) {
      args[token.slice(2)] = argv[i + 1] ?? "";
      i += 1;
    }
  }
  return args;
}

function fail(message) {
  process.stderr.write(`invite-admin: ${message}\n`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const email = (args.email ?? "").trim().toLowerCase();
const role = (args.role ?? "").trim();
const targetEnv = (args.env ?? "").trim();
const redirectTo = (args["redirect-to"] ?? "").trim();

if (email === "" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  fail("valid --email is required.");
}
if (!VALID_ROLES.has(role)) {
  fail("--role must be one of: super_admin, operator.");
}
if (!VALID_ENVS.has(targetEnv)) {
  fail("--env must be one of: development, production. local 초대 금지.");
}
if (redirectTo !== "" && redirectTo !== "http://127.0.0.1:3000/auth/confirm") {
  fail("--redirect-to is allowed only for local verification (http://127.0.0.1:3000/auth/confirm).");
}
if (redirectTo !== "" && targetEnv !== "development") {
  fail("--redirect-to is allowed only with --env development.");
}

const url = (process.env.SUPABASE_URL ?? "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
if (url === "" || serviceRoleKey === "") {
  fail("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.");
}
if (!url.startsWith("https://")) {
  fail("SUPABASE_URL must use https.");
}

process.stdout.write(
  `invite-admin: inviting ${email} as ${role} on ${targetEnv} (${url})\n`,
);

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.auth.admin.inviteUserByEmail(
  email,
  redirectTo === "" ? undefined : { redirectTo },
);

if (error) {
  fail(`supabase invite failed: ${error.message}`);
}

const invitedId = data.user?.id;
if (!invitedId) {
  fail("invite succeeded but no user id was returned.");
}

// 역할은 app_metadata에만 기록한다 (user_metadata는 본인이 수정 가능하므로
// 권한 근거로 사용하지 않음. Admin API로만 설정 가능).
const { error: roleError } = await supabase.auth.admin.updateUserById(
  invitedId,
  { app_metadata: { role } },
);

if (roleError) {
  fail(`role assignment failed: ${roleError.message}`);
}

process.stdout.write(
  `invite-admin: invited user id=${invitedId} with app_metadata.role=${role}. ` +
    `초대 메일의 링크로 비밀번호를 설정하고 첫 로그인 시 OTP를 등록해야 활성화됩니다.\n`,
);
