import "dotenv/config";

import {
  Command,
} from "@langchain/langgraph";

import {
  codingGraph,
} from "../graph/index.js";

import {
  initializeGraph,
} from "../graph/init.js";

const providerName =
  process.env.PROJECT_MANAGEMENT_PROVIDER ||
  "taiga";

const workItemId =
  process.argv[2];

if (!workItemId) {
  console.error(
    "Usage: node src/workflow/resume.js <WORK_ITEM_ID>"
  );

  process.exit(1);
}

const threadId =
  `${providerName}-${workItemId}`;

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
  "RESUMING CODING WORKFLOW"
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

  const result =
    await codingGraph.invoke(
      new Command({
        resume: true,
      }),
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
    "WORKFLOW RESUME FAILED"
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

import { Command } from "@langchain/langgraph";

import { codingGraph } from "../graph/index.js";
import { initializeGraph } from "../graph/init.js";

const taskId = process.argv[2];

if (!taskId) {
  console.error(
    "Usage: node src/workflow/resume.js <ASANA_TASK_ID>"
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
console.log("RESUMING CODING WORKFLOW");
console.log("================================");

console.log("Task ID:", taskId);
console.log("Thread ID:", threadId);

try {
  await initializeGraph();

  const result =
    await codingGraph.invoke(
      new Command({
        resume: true,
      }),
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
    "\nWorkflow resume failed:"
  );

  console.error(error);

  process.exit(1);
}*/





/*import "dotenv/config";

import { Command } from "@langchain/langgraph";

import { codingGraph } from "../graph/index.js";
import { initializeGraph } from "../graph/init.js";

const taskId = process.argv[2];

if (!taskId) {
  console.error(
    "Usage: node src/workflow/resume.js <ASANA_TASK_ID>"
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
console.log("RESUMING CODING WORKFLOW");
console.log("================================");

console.log("Task ID:", taskId);
console.log("Thread ID:", threadId);

try {
  await initializeGraph();

  const result = await codingGraph.invoke(
    new Command({
      resume: true,
    }),
    config
  );

  console.log("\n================================");
  console.log("WORKFLOW RESULT");
  console.log("================================");

  console.log(
    JSON.stringify(result, null, 2)
  );
} catch (error) {
  console.error("\nWorkflow resume failed:");
  console.error(error);

  process.exit(1);
}*/


/*import "dotenv/config";

import { Command } from "@langchain/langgraph";

import { codingGraph } from "../graph/index.js";
import { initializeGraph } from "../graph/init.js";

const taskId = process.argv[2];

if (!taskId) {
  console.error(
    "Usage: node src/workflow/resume.js <ASANA_TASK_ID>"
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
console.log("RESUMING CODING WORKFLOW");
console.log("================================");

console.log("Task ID:", taskId);
console.log("Thread ID:", threadId);

try {
  await initializeGraph();

  const result = await codingGraph.invoke(
    new Command({
      resume: {
        approved: true,
      },
    }),
    config
  );

  console.log("\n================================");
  console.log("WORKFLOW RESULT");
  console.log("================================");

  console.log(
    JSON.stringify(result, null, 2)
  );
} catch (error) {
  console.error("\nWorkflow resume failed:");
  console.error(error);

  process.exit(1);
}*/