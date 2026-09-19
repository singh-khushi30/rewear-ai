export function authErrorMessage(error: { message?: string } | null | undefined) {
  const message = error?.message ?? "";

  if (/invalid login/i.test(message)) {
    return "That email or password is incorrect.";
  }

  if (/already registered|already been registered/i.test(message)) {
    return "An account with that email already exists. Sign in instead.";
  }

  if (/email not confirmed/i.test(message)) {
    return "Confirm your email before signing in.";
  }

  if (/password/i.test(message) && /least|characters|weak/i.test(message)) {
    return "Use a password with at least 6 characters.";
  }

  if (/rate limit|too many/i.test(message)) {
    return "Too many attempts. Wait a moment and try again.";
  }

  if (!message) {
    return "We couldn’t complete that. Try again.";
  }

  return message;
}
