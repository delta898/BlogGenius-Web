"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setPasswordAction } from "../../../server/passwordActions";

export function SetupPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await setPasswordAction(password, confirm);
          if (!result.ok) {
            setError(result.message);
            return;
          }
          router.push(result.next);
          router.refresh();
        });
      }}
    >
      <label htmlFor="new-password">새 비밀번호</label>
      <input
        id="new-password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <label htmlFor="confirm-password">비밀번호 확인</label>
      <input
        id="confirm-password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
      />
      {error !== null ? (
        <p role="alert" className="auth-error">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending}>
        {pending ? "저장 중…" : "비밀번호 저장"}
      </button>
    </form>
  );
}
