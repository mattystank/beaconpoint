import { clearAuth, getApiBaseUrl, getRefreshToken, getToken, setAuth, type StoredUser } from "./auth";

export class ApiClientError extends Error {
  status: number;
  detail: string;

  constructor(message: string, status: number, detail: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.detail = detail;
  }
}

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  requiresAuth?: boolean;
  retries?: number;
  headers?: Record<string, string>;
};

async function safeParseJson(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuth();
    return false;
  }

  const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    clearAuth();
    return false;
  }

  const data = await safeParseJson(res);
  if (!data?.access_token || !data?.user) {
    clearAuth();
    return false;
  }

  setAuth(data.access_token, data.user as StoredUser, data.refresh_token);
  return true;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    requiresAuth = true,
    retries = 1,
    headers = {},
  } = options;

  let token = getToken();
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (requiresAuth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const execute = async (): Promise<Response> => {
    return fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let response = await execute();

  if (response.status === 401 && requiresAuth && retries > 0) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      token = getToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
      response = await apiRequestResponse(path, { method, body, headers: requestHeaders });
    }
  }

  const json = await safeParseJson(response);

  if (!response.ok) {
    const detail = json?.detail || response.statusText || "Unexpected API error";
    throw new ApiClientError(detail, response.status, detail);
  }

  return json as T;
}

async function apiRequestResponse(path: string, options: { method: string; body?: unknown; headers: Record<string, string> }): Promise<Response> {
  const { method, body, headers } = options;
  return fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}