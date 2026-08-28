import "dotenv/config";
import { codingGraph } from "./graph/index.js";

const taskId = process.argv[2];

if (!taskId) {
  console.error(
    "Usage: npm start -- <TAIGA_TASK_ID>"
  );

  process.exit(1);
}

const config = {
  configurable: {
    thread_id: `asana-${taskId}`,
  },
};

const result = await codingGraph.invoke({
   task: {
    id: taskId,
  },
}, config );

console.log("\n==============================");
console.log("FINAL GRAPH STATE");
console.log("==============================");

console.log(result);