/**
 * 비밀번호 정책 (순수 함수 — Server Action 파일에 두지 않는다.
 * "use server" 파일은 async 함수만 export할 수 있다).
 */
export function validateNewPassword(
  password: string,
  confirm: string,
): string | null {
  if (password !== confirm) {
    return "비밀번호가 일치하지 않습니다.";
  }
  if (password.length < 8) {
    return "비밀번호는 8자 이상이어야 합니다.";
  }
  if (password.length > 128) {
    return "비밀번호는 128자 이하여야 합니다.";
  }
  return null;
}
