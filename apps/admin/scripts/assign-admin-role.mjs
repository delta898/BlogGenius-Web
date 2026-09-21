/**
 * 기존 관리자 계정에 역할을 부여/변경한다. 메일을 쓰지 않으므로 SMTP와 무관.
 * 소유자가 로컬에서 직접 실행한다.
 *
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<key> \
 *   node scripts/assign-admin-role.mjs --email admin@example.com --role super_admin --env development
 *
 * 규칙:
 * - service_role 키는 실행 시점 환경에서만 읽는다. repo·이미지·로그에 남기지 않는다.
 * - 역할은 super_admin|operator만 허용한다 (viewer 없음, 0층 계약).
 * - 역할은 auth user의 app_metadata에만 기록한다 (본인 승격 방지).
 * - 마지막 super_admin 강등·삭제 방지는 Backoffice UI(use case) 책임이다.
 *   이 스크립트는 소유자의 명시적 실행이 곧 승인이다.
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
  process.stderr.write(`assign-admin-role: ${message}\n`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const email = (args.email ?? "").trim().toLowerCase();
const role = (args.role ?? "").trim();
const targetEnv = (args.env ?? "").trim();

if (email === "" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  fail("valid --email is required.");
}
if (!VALID_ROLES.has(role)) {
  fail("--role must be one of: super_admin, operator.");
}
if (!VALID_ENVS.has(targetEnv)) {
  fail("--env must be one of: development, production. local 금지.");
}

const url = (process.env.SUPABASE_URL ?? "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
if (url === "" || serviceRoleKey === "") {
  fail("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.");
}
if (!url.startsWith("https://")) {
  fail("SUPABASE_URL must use https.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (listError) {
  fail(`user lookup failed: ${listError.message}`);
}
const target = (listed?.users ?? []).find(
  (user) => (user.email ?? "").toLowerCase() === email,
);
if (!target) {
  fail(`no user found for ${email} on ${targetEnv} (${url}).`);
}

process.stdout.write(
  `assign-admin-role: setting ${email} (id=${target.id}) to ${role} on ${targetEnv} (${url})\n`,
);

const { error: roleError } = await supabase.auth.admin.updateUserById(
  target.id,
  { app_metadata: { ...(target.app_metadata ?? {}), role } },
);
if (roleError) {
  fail(`role assignment failed: ${roleError.message}`);
}

process.stdout.write(
  `assign-admin-role: done. app_metadata.role=${role}.\n`,
);
