import "dotenv/config";

import { codingGraph } from "../graph/index.js";

import { initializeGraph } from "../graph/init.js";

import {
  getProjectManagementProvider,
} from "../integrations/pms/index.js";

const providerName = process.env.PROJECT_MANAGEMENT_PROVIDER || "taiga";

const workItemId = process.argv[2];

// console.log(typeof workItemId)

if (!workItemId) {
  console.error(
    "Usage: node src/workflow/start.js <WORK_ITEM_ID>"
  );

  process.exit(1);
}

const threadId =`${providerName}-${workItemId}`;

const config = {
  configurable: {
    thread_id:
      threadId,
  },
};

console.log(
  "================================"
);

console.log(
  "STARTING CODING WORKFLOW"
);

console.log(
  "================================"
);

console.log(
  `Provider: ${providerName}`
);

console.log(
  `Work Item ID: ${workItemId}`
);

console.log(
  `Thread ID: ${threadId}`
);

try {
  await initializeGraph();

  const provider = getProjectManagementProvider(providerName);

  const workItem = await provider.getWorkItem(workItemId);

  console.log(`Current status: ${workItem.status.name}`);

  /*
   * Only this status can start
   * the AI planning workflow.
   *
   * For Taiga this resolves to:
   *
   * Ready For NS Code Factory
   */
  if (providerName === "taiga" && workItem.status.name !== "Ready For NS Code Factory") {
    throw new Error(
      `Workflow can only start when the Taiga User Story status is "Ready For NS Code Factory". ` +
      `Current status: "${workItem.status.name}".`
    );
  }

  const result =
    await codingGraph.invoke(
      {
        provider: providerName,

        task: {
          id: Number(workItemId),
        },
      },
      config
    );

  console.log(
    "\n================================"
  );

  console.log(
    "WORKFLOW RESULT"
  );

  console.log(
    "================================\n"
  );

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

} catch (error) {
  console.error(
    "\n================================"
  );

  console.error(
    "WORKFLOW FAILED"
  );

  console.error(
    "================================\n"
  );

  console.error(
    `Reason: ${error.message}`
  );

  console.error(
    `Code: ${
      error.code ||
      "UNKNOWN"
    }`
  );

  console.error(
    `Provider: ${
      error.provider ||
      providerName
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
      `HTTP Status: ${
        error.statusCode
      }`
    );
  }

  process.exitCode = 1;
}



/*import "dotenv/config";

import { codingGraph } from "../graph/index.js";
import { initializeGraph } from "../graph/init.js";
import { asana } from "../integrations/pms/asana/index.js";
import { mapAsanaTask } from "../integrations/pms/asana/mapper.js";

const taskId = process.argv[2];

if (!taskId) {
  console.error(
    "Usage: node src/workflow/start.js <ASANA_TASK_ID>"
  );

  process.exit(1);
}

const threadId = `asana-${taskId}`;

const config = {
  configurable: {
    thread_id: threadId,
  },
};

console.log("================================");
console.log("STARTING CODING WORKFLOW");
console.log("================================");

console.log("Task ID:", taskId);
console.log("Thread ID:", threadId);

try {
  await initializeGraph();

  const response = await asana.getTask(taskId);

  const task = mapAsanaTask(response);

  console.log("Current Asana AI Coding Status:", task.workflowStatusField?.value ?? "NOT SET");

  if ( task.workflowStatusField?.value !== "Planning") {
    throw new Error(
      `Workflow can only start when AI Coding Status is "Planning". Current status: ${
        task.workflowStatusField?.value ?? "NOT SET"
      }`
    );
  }

  const result =
    await codingGraph.invoke(
      {
        task: {
          id: taskId,
        },
      },
      config
    );

  console.log("\n================================");
  console.log("WORKFLOW RESULT");
  console.log("================================");

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
} catch (error) {
  console.error(
    "\nWorkflow failed:"
  );

  console.error(error);

  process.exit(1);
}*/




/*import "dotenv/config";

import { codingGraph } from "../graph/index.js";
import { initializeGraph } from "../graph/init.js";

const taskId = process.argv[2];

if (!taskId) {
  console.error(
    "Usage: node src/workflow/start.js <ASANA_TASK_ID>"
  );

  process.exit(1);
}

const threadId = `asana-${taskId}`;

const config = {
  configurable: {
    thread_id: threadId,
  },
};

console.log("================================");
console.log("STARTING CODING WORKFLOW");
console.log("================================");

console.log("Task ID:", taskId);
console.log("Thread ID:", threadId);

try {
  await initializeGraph();

  const result = await codingGraph.invoke(
    {
      task: {
        id: taskId,
      },
    },
    config
  );

  console.log("\n================================");
  console.log("WORKFLOW RESULT");
  console.log("================================");

  console.log(
    JSON.stringify(result, null, 2)
  );
} catch (error) {
  console.error("\nWorkflow failed:");
  console.error(error);

  process.exit(1);
}*/