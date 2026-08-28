import "dotenv/config";

import { getProjectManagementProvider } from "../index.js";

import {
  WorkflowStatus,
} from "../status/workflow-status.js";

const provider =
  getProjectManagementProvider("taiga");

const projectId =
  process.env.TAIGA_PROJECT_ID;

const workflowStatuses = [
  WorkflowStatus.TODO,
  WorkflowStatus.READY_FOR_PLANNING,
  WorkflowStatus.PLAN_READY,
  WorkflowStatus.PLAN_CHANGES_REQUESTED,
  WorkflowStatus.APPROVED_FOR_DEV,
  WorkflowStatus.CODING_IN_PROGRESS,
  WorkflowStatus.DONE,
];

console.log(
  "\n======================================"
);
console.log(
  "TAIGA WORKFLOW STATUS RESOLUTION"
);
console.log(
  "======================================\n"
);

for (const workflowStatus of workflowStatuses) {
  const id =
    await provider.resolveStatusId(
      projectId,
      workflowStatus
    );

  console.log(
    `${workflowStatus.padEnd(28)} -> ${id}`
  );
}