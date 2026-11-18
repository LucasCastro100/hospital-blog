const TOKEN_KEY = "hospital-blog-token";

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string) {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 12}; samesite=lax`;
}

export function clearToken() {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
}
