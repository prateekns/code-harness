import {
  ProjectManagementError,
} from "./errors.js";

import {
  createTaigaProvider,
} from "./taiga/index.js";

export function getProjectManagementProvider(
  provider
) {
  switch (provider) {
    case "taiga":
      return createTaigaProvider();

    case "asana":
      throw new ProjectManagementError({
        message:
          "Asana integration is not connected to the generic provider yet.",

        code:
          "ASANA_PROVIDER_NOT_CONNECTED",

        provider: "asana",

        retryable: false,
      });

    default:
      throw new ProjectManagementError({
        message:
          `Unsupported project management provider: ${provider}`,

        code:
          "UNSUPPORTED_PROJECT_MANAGEMENT_PROVIDER",

        provider,

        retryable: false,
      });
  }
}



/*import {
  ProjectManagementError,
} from "./errors.js";

import {
  createTaigaProvider,
} from "./taiga/index.js";

export function getProjectManagementProvider(
  provider
) {
  switch (provider) {
    case "taiga":
      return createTaigaProvider();

    case "asana":
      throw new Error(
        "Asana provider is not connected to the generic provider layer yet."
      );

    default:
      throw new ProjectManagementError({
        message:
          `Unsupported project management provider: ${provider}`,

        code:
          "UNSUPPORTED_PROJECT_MANAGEMENT_PROVIDER",

        provider,

        retryable: false,
      });
  }
}*/