/**
 * Central API client for backend calls. The Vite proxy forwards /api/* to the
 * backend, keeping backend configuration and authentication concerns out of UI
 * components.
 */
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE = '/api';
const DEFAULT_TIMEOUT_MS = 30_000;
const UPLOAD_TIMEOUT_MS = 90_000;

export class AuthenticationError extends Error {
  constructor(message = 'Your session is no longer valid. Please sign in again.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function getAccessToken() {
  try {
    const session = await fetchAuthSession();
    const accessToken = session.tokens?.accessToken?.toString();

    if (!accessToken) {
      throw new AuthenticationError();
    }

    return accessToken;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    throw new AuthenticationError();
  }
}

function buildUrl(path) {
  return path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const body = await response.text();

  if (!body) {
    return null;
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(body);
    } catch {
      throw new ApiError('The server returned an invalid response.');
    }
  }

  return body;
}

function getErrorMessage(data, status) {
  if (data && typeof data === 'object') {
    return data.error || data.message || `Request failed with status ${status}.`;
  }

  return typeof data === 'string' && data.trim()
    ? data
    : `Request failed with status ${status}.`;
}

async function request(path, { method = 'GET', body, headers, timeout = DEFAULT_TIMEOUT_MS } = {}) {
  const accessToken = await getAccessToken();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);
  const requestHeaders = new Headers(headers);

  requestHeaders.set('Authorization', `Bearer ${accessToken}`);

  if (body !== undefined && !(body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers: requestHeaders,
      body: body instanceof FormData || body === undefined ? body : JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 401) {
      throw new AuthenticationError();
    }

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError(getErrorMessage(data, response.status), {
        status: response.status,
        data,
      });
    }

    return data;
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError('The request timed out. Please try again.');
    }

    throw new ApiError('Unable to reach the server. Please check your connection and try again.');
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, data, options) => request(path, { ...options, method: 'POST', body: data }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  upload: (file, { path = '/analyze-report', fieldName = 'report', ...options } = {}) => {
    const formData = new FormData();
    formData.append(fieldName, file);

    return request(path, {
      ...options,
      method: 'POST',
      body: formData,
      timeout: options.timeout ?? UPLOAD_TIMEOUT_MS,
    });
  },
};

/** Backward-compatible domain helpers for the existing UI. */
export function analyzeReport(file) {
  return api.upload(file);
}

export async function sendChatMessage(message, reportContext = null, history = []) {
  const data = await api.post('/chat', { message, reportContext, history });
  return data.reply;
}
