const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function postJson(path, body, { signal } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(
      "The caption service could not be reached. Check that the Flask server is running, then try again.",
      0,
      null,
    );
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    // The Flask routes normally return JSON. Keep a useful fallback for proxy errors.
  }

  if (!response.ok || payload?.error) {
    throw new ApiError(
      payload?.error || `The caption service returned HTTP ${response.status}.`,
      response.status,
      payload,
    );
  }

  return payload;
}

export async function getBackendHealth({ signal } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiError("The Flask backend could not be reached.", 0, null);
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    // Health is expected to be JSON; a non-JSON response means the service is unhealthy.
  }

  if (!response.ok || typeof payload?.status !== "string") {
    throw new ApiError(
      `The backend health check returned HTTP ${response.status}.`,
      response.status,
      payload,
    );
  }

  return payload;
}

export function listCaptions(link, options) {
  return postJson("/captions/list", { link }, options);
}

export function getSyncedLyrics(link, captionCode, options) {
  return postJson("/captions/get", { link, captionCode }, options);
}
