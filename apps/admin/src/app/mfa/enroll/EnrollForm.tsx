"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  confirmEnrollAction,
  enrollTotpAction,
  unenrollTotpAction,
  type TotpEnrollment,
} from "../../../server/authActions";

export function EnrollForm({
  verifiedFactors,
}: {
  verifiedFactors: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      {verifiedFactors.length > 0 ? (
        <ul className="factor-list">
          {verifiedFactors.map((factor) => (
            <li key={factor.id}>
              <span>{factor.name}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const result = await unenrollTotpAction(factor.id);
                    if (!result.ok) {
                      setError(result.message);
                      return;
                    }
                    router.push(result.next);
                    router.refresh();
                  });
                }}
              >
                해제
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {enrollment === null ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await enrollTotpAction();
              if (!result.ok) {
                setError(result.message);
                return;
              }
              setEnrollment(result.enrollment);
            });
          }}
        >
          {pending ? "준비 중…" : "새 OTP 등록 시작"}
        </button>
      ) : (
        <div className="enrollment-box">
          {enrollment.qrCode !== null ? (
            <div
              className="qr-code"
              // Supabase가 발급한 QR SVG를 그대로 렌더링한다.
              dangerouslySetInnerHTML={{ __html: enrollment.qrCode }}
            />
          ) : null}
          <dl>
            <dt>직접 입력용 키</dt>
            <dd>
              <code>{enrollment.secret}</code>
            </dd>
          </dl>
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              startTransition(async () => {
                const result = await confirmEnrollAction(
                  enrollment.factorId,
                  code,
                );
                if (!result.ok) {
                  setError(result.message);
                  return;
                }
                router.push(result.next);
                router.refresh();
              });
            }}
          >
            <label htmlFor="enroll-code">OTP 6자리</label>
            <input
              id="enroll-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              minLength={6}
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            {error !== null ? (
              <p role="alert" className="auth-error">
                {error}
              </p>
            ) : null}
            <button type="submit" disabled={pending}>
              {pending ? "확인 중…" : "등록 완료"}
            </button>
          </form>
        </div>
      )}
      {error !== null && enrollment === null ? (
        <p role="alert" className="auth-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
