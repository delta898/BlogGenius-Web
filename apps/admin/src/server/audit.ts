import { getRuntimeEnvironment } from "./environment";

export type AuditResult = "success" | "failure";

export interface AuditEvent {
  actor: string;
  actorRole: string | null;
  environment: string;
  action: string;
  target: string | null;
  requestId: string;
  timestamp: string;
  result: AuditResult;
  reasonCode: string | null;
  detail: Record<string, string | number | boolean | null>;
}

export interface AuditSink {
  write(event: AuditEvent): void;
}

/**
 * 1층 sink: 서버 표준 출력(JSONL). DB append-only 테이블은 migration ownership
 * 결정(Desktop 저장소 canonical 유지 vs Web 소유) 이후에 연결한다.
 * stdout 기록이 곧 감사 추적의 1차 원천이므로 포맷을 안정적으로 유지한다.
 */
export const stdoutAuditSink: AuditSink = {
  write(event: AuditEvent): void {
    process.stdout.write(`[audit] ${JSON.stringify(event)}\n`);
  },
};

/** 이메일 앞부분만 마스킹. 로그·audit에 원본을 남기지 않는다. */
export function maskEmail(email: string | null | undefined): string | null {
  if (email === null || email === undefined) return null;
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return "***";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const domainDot = domain.indexOf(".");
  const maskedDomain =
    domainDot <= 0
      ? "***"
      : `${domain.slice(0, 1)}***.${domain.slice(domainDot + 1).slice(0, 1)}***`;
  return `${local.slice(0, 1)}***@${maskedDomain}`;
}

export function buildAuditEvent(input: {
  actor: string;
  actorRole?: string | null;
  action: string;
  target?: string | null;
  requestId: string;
  result: AuditResult;
  reasonCode?: string | null;
  detail?: Record<string, string | number | boolean | null>;
  timestamp?: string;
}): AuditEvent {
  return {
    actor: input.actor,
    actorRole: input.actorRole ?? null,
    environment: getRuntimeEnvironment(),
    action: input.action,
    target: input.target ?? null,
    requestId: input.requestId,
    timestamp: input.timestamp ?? new Date().toISOString(),
    result: input.result,
    reasonCode: input.reasonCode ?? null,
    detail: input.detail ?? {},
  };
}

/**
 * audit 기록 자체가 실패하면 호출자가 mutation을 성공 처리하지 않도록
 * 예외를 그대로 전파한다 (삼키지 않음).
 */
export function recordAuditEvent(
  input: Parameters<typeof buildAuditEvent>[0],
  sink: AuditSink = stdoutAuditSink,
): AuditEvent {
  const event = buildAuditEvent(input);
  sink.write(event);
  return event;
}
