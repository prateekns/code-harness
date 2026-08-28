import "dotenv/config";

import { asana } from "./index.js";

const taskId = process.argv[2];

if (!taskId) {
  console.error("Usage: node src/integrations/asana/test.js <TASK_ID>");
  process.exit(1);
}

const response = await asana.getTask(taskId);

console.log(
  JSON.stringify(response, null, 2)
);