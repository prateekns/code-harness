import "dotenv/config";

import {
  getProjectManagementProvider,
} from "../index.js";

const userStoryId =
  process.argv[2];

if (!userStoryId) {
  console.error(
    "Usage: node src/integrations/pms/taiga/history-test.js <userStoryId>"
  );

  process.exit(1);
}

try {
  const provider =
    getProjectManagementProvider(
      "taiga"
    );

  console.log(
    "\n================================"
  );

  console.log(
    "TAIGA USER STORY HISTORY"
  );

  console.log(
    "================================\n"
  );

  console.log(
    `User Story ID: ${userStoryId}`
  );

  const history =
    await provider.getWorkItemHistory(
      userStoryId
    );

  console.log(
    "\nHistory:\n"
  );

  console.log(
    JSON.stringify(
      history,
      null,
      2
    )
  );

} catch (error) {
  console.error(
    "\n================================"
  );

  console.error(
    "TAIGA HISTORY FETCH FAILED"
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