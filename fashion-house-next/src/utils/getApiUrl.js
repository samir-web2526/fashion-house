export function getApiUrl() {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  url = url.trim().replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url += "/api";
  }
  return url;
}
