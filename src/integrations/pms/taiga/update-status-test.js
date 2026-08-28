import "dotenv/config";

import {
  getProjectManagementProvider,
} from "../index.js";

import {
  WorkflowStatus,
} from "../status/workflow-status.js";

const userStoryId =
  process.argv[2];

const workflowStatus =
  process.argv[3];

if (!userStoryId) {
  console.error(
    "Usage: node src/integrations/pms/taiga/update-status-test.js <userStoryId> <workflowStatus>"
  );

  console.error(
    "\nExample:"
  );

  console.error(
    "node src/integrations/pms/taiga/update-status-test.js 12345 PLAN_READY"
  );

  process.exit(1);
}

if (!workflowStatus) {
  console.error(
    "Workflow status is required."
  );

  process.exit(1);
}

if (
  !Object.values(
    WorkflowStatus
  ).includes(workflowStatus)
) {
  console.error(
    `Unknown workflow status: ${workflowStatus}`
  );

  console.error(
    "\nAvailable statuses:"
  );

  console.error(
    Object.values(
      WorkflowStatus
    ).join("\n")
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
    "UPDATING TAIGA USER STORY STATUS"
  );

  console.log(
    "================================\n"
  );

  console.log(
    `User Story ID: ${userStoryId}`
  );

  console.log(
    `Workflow Status: ${workflowStatus}`
  );

  console.log(
    "\nUpdating..."
  );

  const updatedUserStory =
    await provider.updateWorkItemStatus(
      userStoryId,
      workflowStatus
    );

  console.log(
    "\n================================"
  );

  console.log(
    "STATUS UPDATE SUCCESS"
  );

  console.log(
    "================================\n"
  );

  console.log({
    id:
      updatedUserStory.id,

    reference:
      updatedUserStory.reference,

    title:
      updatedUserStory.title,

    status:
      updatedUserStory.status,
  });

} catch (error) {
  console.error("\n================================");
  console.error("TAIGA STATUS UPDATE FAILED");
  console.error("================================\n");
//   console.log(error);
  console.error(`Reason: ${error.message}`);
  console.error(`Code: ${error.code || "UNKNOWN"}`);
  console.error(`Provider: ${error.provider || "taiga"}`);

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