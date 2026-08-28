import "dotenv/config";

import {
  getProjectManagementProvider,
} from "../index.js";

const projectId =
  process.env.TAIGA_PROJECT_ID;

if (!projectId) {
  console.error(
    "TAIGA_PROJECT_ID is not configured."
  );

  process.exit(1);
}

try {
  const provider =
    getProjectManagementProvider(
      "taiga"
    );

  const statuses =
    await provider.getStatuses(
      projectId
    );

  console.log(
    "\n================================"
  );

  console.log(
    "TAIGA USER STORY STATUSES"
  );

  console.log(
    "================================\n"
  );

  console.log(
    JSON.stringify(
      statuses,
      null,
      2
    )
  );

} catch (error) {
  console.error(
    "\n================================"
  );

  console.error(
    "TAIGA USER STORY STATUS FETCH FAILED"
  );

  console.error(
    "================================\n"
  );

  console.error(
    `Reason: ${error.message}`
  );

  console.error(
    `Code: ${error.code || "UNKNOWN"}`
  );

  console.error(
    `Provider: ${
      error.provider || "taiga"
    }`
  );

  console.error(
    `Retryable: ${
      error.retryable
        ? "Yes"
        : "No"
    }`
  );

  if (error.statusCode) {
    console.error(
      `HTTP Status: ${error.statusCode}`
    );
  }

  process.exitCode = 1;
}