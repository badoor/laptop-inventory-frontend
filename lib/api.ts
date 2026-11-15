const API_URL = '/api'; // через rewrites

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new ApiError(401, 'Unauthorized');
  }

  if (!res.ok) {
  let message = `Ошибка ${res.status}`;
  try {
    const body = await res.json();
    // NestJS возвращает { statusCode, message } или { message: [...] }
    if (Array.isArray(body.message)) {
      message = body.message.join(', ');
    } else if (body.message) {
      message = body.message;
    }
  } catch {
    // тело не JSON — оставляем статус
  }
  throw new ApiError(res.status, message);
}

  if (res.status === 204) return undefined as T;
  return res.json();
}