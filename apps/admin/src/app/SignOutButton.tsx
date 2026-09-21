"use client";

import { signOutAction } from "../server/authActions";

export function SignOutButton() {
  return (
    <button type="button" onClick={() => void signOutAction()}>
      로그아웃
    </button>
  );
}
