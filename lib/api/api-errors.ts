export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object') {
    const { error, message } = payload as { error?: unknown; message?: unknown };
    const errorMessage = message ?? error;

    if (Array.isArray(errorMessage)) return errorMessage.join(', ');
    if (typeof errorMessage === 'string') return errorMessage;
  }

  return fallback;
}

export function getErrorStatus(payload: unknown, fallback: number) {
  if (payload && typeof payload === 'object') {
    const { status, statusCode } = payload as { status?: unknown; statusCode?: unknown };
    const errorStatus = statusCode ?? status;

    if (typeof errorStatus === 'number') return errorStatus;
    if (typeof errorStatus === 'string') {
      const parsedStatus = Number(errorStatus);

      if (Number.isInteger(parsedStatus)) return parsedStatus;
    }
  }

  return fallback;
}
