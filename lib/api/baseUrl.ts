const LOCAL_API_BASE_URL = "http://localhost:8000";

export function getApiBaseUrl(): string {
  if (process.env.NODE_ENV !== "production") {
    return LOCAL_API_BASE_URL;
  }

  return process.env.NEXT_PUBLIC_API_BASE_URL ?? LOCAL_API_BASE_URL;
}
