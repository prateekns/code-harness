import "dotenv/config";

import {
  Command,
} from "@langchain/langgraph";

import { codingGraph } from "../graph/index.js";

const taskId = process.argv[2];

if (!taskId) {
  console.error(
    "Usage: node src/workflow/testResume.js <ASANA_TASK_ID>"
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
console.log("STARTING WORKFLOW");
console.log("================================");

console.log("Task ID:", taskId);
console.log("Thread ID:", threadId);

const firstResult = await codingGraph.invoke(
  {
    task: {
      id: taskId,
    },
  },
  config
);

console.log("\n================================");
console.log("WORKFLOW INTERRUPTED");
console.log("================================");

console.log(
  JSON.stringify(firstResult, null, 2)
);

console.log("\n");

console.log("Press ENTER to resume...");

process.stdin.setEncoding("utf8");

await new Promise((resolve) => {
  process.stdin.once("data", resolve);
});

console.log("\n================================");
console.log("RESUMING WORKFLOW");
console.log("================================");

const secondResult = await codingGraph.invoke(
  new Command({
    resume: {
      approved: true,
    },
  }),
  config
);

console.log("\n================================");
console.log("FINAL WORKFLOW RESULT");
console.log("================================");

console.log(
  JSON.stringify(secondResult, null, 2)
);

process.exit(0);