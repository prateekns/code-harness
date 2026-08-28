import "dotenv/config";

import { getProjectManagementProvider,} from "../index.js";

const taskId =
  process.argv[2];

if (!taskId) {
  console.error(
    "Usage: node src/integrations/pms/taiga/task-test.js <taskId>"
  );

  process.exit(1);
}

try {
  const provider =
    getProjectManagementProvider(
      "taiga"
    );

  const task =
    await provider.getTask(
      taskId
    );

  console.log(
    "\n================================"
  );

  console.log(
    "TAIGA TASK"
  );

  console.log(
    "================================\n"
  );

  console.log(
    JSON.stringify(
      task,
      null,
      2
    )
  );

} catch (error) {
  console.error(
    "\n================================"
  );

  console.error(
    "TAIGA TASK FETCH FAILED"
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
    `Provider: ${error.provider || "taiga"}`
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