import {
  ProjectManagementError,
} from "../errors.js";

export class TaigaClient {

  constructor({baseUrl,authToken,}) {

    if (!baseUrl) {
      throw new ProjectManagementError({
        message: "Taiga base URL is not configured.",
        code: "TAIGA_BASE_URL_MISSING",
        provider: "taiga",
        retryable: false,
      });
    }

    if (!authToken) {
      throw new ProjectManagementError({
        message: "Taiga authentication token is not configured.",
        code:"TAIGA_AUTH_TOKEN_MISSING",
        provider: "taiga",
        retryable: false,
      });
    }

    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.authToken = authToken;
  }

  async request(path, {method = "GET", body = undefined, returnHeader = false} = {}) {

    const url = `${this.baseUrl}/api/v1${path}`;
    console.log(`Request Path: ${url}\n`)

    let response;

    try {
      response = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      throw new ProjectManagementError({
        message:
          "Could not connect to the Taiga server. " +
          "Please check the Taiga URL and network connection.",

        code: "TAIGA_NETWORK_ERROR",
        provider: "taiga",
        retryable: true,
        cause: error,
      });
    }

    const responseText = await response.text();

    let responseData = null;

    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }
    }

    if (!response.ok) {
      throw this.createApiError({
        response,
        responseData,
      });
    }

    // Normally return only the response body
    if (!returnHeader) {
      return responseData;
    }

    // When requested, expose headers as well
    return {
      data: responseData,
      headers: response.headers,
    };
  }

  createApiError({response,responseData,}) {
    const status = response.status;

    if ( status === 401) {

      return new ProjectManagementError({
        message: "Taiga authentication failed. " + "Please check TAIGA_AUTH_TOKEN.",
        code: "TAIGA_AUTHENTICATION_ERROR",
        provider: "taiga",
        statusCode: status,
        retryable: false,
        cause: responseData,
      });
    }

    if (status === 403) {
      return new ProjectManagementError({
        message: "Taiga denied access to this resource. " + "Please check the token permissions and project access.",
        code:"TAIGA_PERMISSION_ERROR",
        provider: "taiga",
        statusCode: status,
        retryable: false,
        cause: responseData,
      });
    }

    if (status === 404) {
      return new ProjectManagementError({
        message: "The requested Taiga resource was not found. " + "Please check the project or task ID.",
        code: "TAIGA_RESOURCE_NOT_FOUND",
        provider: "taiga",
        statusCode: status,
        retryable: false,
        cause: responseData,
      });
    }

    if (status === 429) {
      return new ProjectManagementError({
        message: "Taiga rate limit was reached. " + "Please wait and try again.",
        code: "TAIGA_RATE_LIMIT",
        provider: "taiga",
        statusCode: status,
        retryable: true,
        cause: responseData,
      });
    }

    if (status >= 500) {
      return new ProjectManagementError({
        message: "Taiga is temporarily unavailable. " + "Please try again later.",
        code: "TAIGA_SERVER_ERROR",
        provider: "taiga",
        statusCode: status,
        retryable: true,
        cause: responseData,
      });
    }

    return new ProjectManagementError({
      message: "Taiga rejected the API request.",
      code: "TAIGA_API_ERROR",
      provider: "taiga",
      statusCode: status,
      retryable: false,
      cause: responseData,
    });
  }
}