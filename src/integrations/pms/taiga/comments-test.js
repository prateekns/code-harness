import "dotenv/config";

import {
  getProjectManagementProvider,
} from "../index.js";

const userStoryId =
  process.argv[2];

if (!userStoryId) {
  console.error(
    "Usage: node src/integrations/pms/taiga/comments-test.js <userStoryId>"
  );

  process.exit(1);
}

try {
  const provider =
    getProjectManagementProvider(
      "taiga"
    );

  const comments =
    await provider.getWorkItemComments(
      userStoryId
    );

  console.log(
    "\n================================"
  );

  console.log(
    "TAIGA USER STORY COMMENTS"
  );

  console.log(
    "================================\n"
  );

  console.log(
    `User Story ID: ${userStoryId}`
  );

  console.log(
    `Comments found: ${comments.length}`
  );

  console.log();

  for (const comment of comments) {
    console.log(
      "--------------------------------"
    );

    console.log(
      `ID: ${comment.id}`
    );

    console.log(
      `Author: ${comment.authorName}`
    );

    console.log(
      `Created: ${comment.createdAt}`
    );

    console.log(
      `Text: ${comment.text}`
    );

    console.log();
  }

} catch (error) {
  console.error(
    "\n================================"
  );

  console.error(
    "TAIGA COMMENT FETCH FAILED"
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