import "dotenv/config";

import {
  getProjectManagementProvider,
} from "../index.js";

const userStoryId =
  process.argv[2];

if (!userStoryId) {
  console.error(
    "Usage: node src/integrations/pms/taiga/user-story-test.js <userStoryId>"
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
    "PROVIDER DIAGNOSTICS"
  );

  console.log(
    "================================\n"
  );

  console.log(
    "Provider constructor:",
    provider.constructor.name
  );

  console.log(
    "getWorkItem:",
    typeof provider.getWorkItem
  );

  console.log(
    "resolveWorkflowStatus:",
    typeof provider.resolveWorkflowStatus
  );

  console.log(
    "getStatuses:",
    typeof provider.getStatuses
  );

  console.log(
    "\n================================"
  );

  console.log(
    "FETCHING TAIGA USER STORY"
  );

  console.log(
    "================================\n"
  );

  const userStory =
    await provider.getWorkItem(
      userStoryId
    );

  console.log(
    "\n================================"
  );

  console.log(
    "TAIGA USER STORY"
  );

  console.log(
    "================================\n"
  );

  console.log(
    JSON.stringify(
      userStory,
      null,
      2
    )
  );

} catch (error) {
  console.error(
    "\n================================"
  );

  console.error(
    "TAIGA USER STORY FETCH FAILED"
  );

  console.error(
    "================================\n"
  );

  console.error(
    `Reason: ${error.message}`
  );

  console.error(
    `Code: ${
      error.code || "UNKNOWN"
    }`
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

  console.error(
    "\nTechnical error:"
  );

  console.error(error);

  process.exitCode = 1;
}