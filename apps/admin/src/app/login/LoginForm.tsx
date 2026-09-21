"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signInAction } from "../../server/authActions";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await signInAction(email, password);
          if (!result.ok) {
            setError(result.message);
            return;
          }
          router.push(result.next);
        });
      }}
    >
      <label htmlFor="login-email">이메일</label>
      <input
        id="login-email"
        name="email"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <label htmlFor="login-password">비밀번호</label>
      <input
        id="login-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error !== null ? (
        <p role="alert" className="auth-error">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending}>
        {pending ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}
