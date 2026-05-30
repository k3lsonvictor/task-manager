export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message: unknown }).message;

    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }

  return fallback;
}
