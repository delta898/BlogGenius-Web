"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { verifyTotpAction } from "../../server/authActions";

export function VerifyForm({ factorId }: { factorId: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await verifyTotpAction(factorId, code);
          if (!result.ok) {
            setError(result.message);
            return;
          }
          router.push(result.next);
          router.refresh();
        });
      }}
    >
      <label htmlFor="mfa-code">OTP 6자리</label>
      <input
        id="mfa-code"
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
        {pending ? "확인 중…" : "인증"}
      </button>
    </form>
  );
}
