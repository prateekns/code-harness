export class LLMError extends Error {
  constructor({
    message,
    code = "LLM_ERROR",
    provider = "unknown",
    model = null,
    retryable = false,
    statusCode = null,
    cause = null,
  }) {
    super(message);

    this.name = "LLMError";
    this.code = code;
    this.provider = provider;
    this.model = model;
    this.retryable = retryable;
    this.statusCode = statusCode;
    this.cause = cause;
  }
}

export function normalizeLLMError({
  error,
  provider,
  model,
}) {
  const statusCode =
    error?.statusCode ??
    error?.status ??
    error?.response?.status ??
    null;

  const rawMessage =
    error?.message ||
    String(error);

  /*
   * Authentication
   */
  if (
    statusCode === 401 ||
    /unauthorized|invalid.*api.*key|authentication/i.test(
      rawMessage
    )
  ) {
    return new LLMError({
      message:
        "The LLM provider rejected the API key. " +
        "Please check your OpenRouter API key configuration.",

      code: "LLM_AUTHENTICATION_ERROR",

      provider,

      model,

      retryable: false,

      statusCode,

      cause: error,
    });
  }

  /*
   * Permission
   */
  if (statusCode === 403) {
    return new LLMError({
      message:
        "The LLM provider denied access to this request. " +
        "Please check your OpenRouter account permissions " +
        "and model access.",

      code: "LLM_PERMISSION_ERROR",

      provider,

      model,

      retryable: false,

      statusCode,

      cause: error,
    });
  }

  /*
   * Insufficient balance / credits
   */
  if (
    statusCode === 402 ||
    /insufficient.*balance|insufficient.*credit|credits|balance/i.test(
      rawMessage
    )
  ) {
    return new LLMError({
      message:
        "The LLM request could not be completed because " +
        "the OpenRouter account does not have sufficient " +
        "balance or credits.",

      code: "LLM_INSUFFICIENT_BALANCE",

      provider,

      model,

      retryable: false,

      statusCode,

      cause: error,
    });
  }

  /*
   * Rate limit
   */
  if (
    statusCode === 429 ||
    /rate.?limit|too many requests/i.test(
      rawMessage
    )
  ) {
    return new LLMError({
      message:
        "The LLM provider rate limit has been reached. " +
        "The request should be retried after a short delay.",

      code: "LLM_RATE_LIMIT",

      provider,

      model,

      retryable: true,

      statusCode,

      cause: error,
    });
  }

  /*
   * Provider unavailable
   */
  if (
    statusCode === 502 ||
    statusCode === 503 ||
    statusCode === 504
  ) {
    return new LLMError({
      message:
        "The LLM provider is temporarily unavailable. " +
        "Please retry the request later.",

      code: "LLM_PROVIDER_UNAVAILABLE",

      provider,

      model,

      retryable: true,

      statusCode,

      cause: error,
    });
  }

  /*
   * Network error
   */
  if (
    error?.code === "ECONNREFUSED" ||
    error?.code === "ECONNRESET" ||
    error?.code === "ETIMEDOUT" ||
    /network|timeout|fetch failed|socket/i.test(
      rawMessage
    )
  ) {
    return new LLMError({
      message:
        "The application could not connect to the LLM provider. " +
        "Please check the network connection and try again.",

      code: "LLM_NETWORK_ERROR",

      provider,

      model,

      retryable: true,

      statusCode,

      cause: error,
    });
  }

  /*
   * Unknown error
   */
  return new LLMError({
    message:
      "The LLM request failed unexpectedly. " +
      "Please check the application logs for technical details.",

    code: "LLM_UNKNOWN_ERROR",

    provider,

    model,

    retryable: false,

    statusCode,

    cause: error,
  });
}