import "dotenv/config";

import {
  getProjectManagementProvider,
} from "../index.js";

const userStoryId =
  process.argv[2];

const comment =
  process.argv
    .slice(3)
    .join(" ");

if (!userStoryId) {
  console.error(
    "Usage: node src/integrations/pms/taiga/add-comment-test.js <userStoryId> <comment>"
  );

  process.exit(1);
}

if (!comment.trim()) {
  console.error(
    "Comment text is required."
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
    "ADDING TAIGA USER STORY COMMENT"
  );

  console.log(
    "================================\n"
  );

  console.log(
    `User Story ID: ${userStoryId}`
  );

  console.log(
    `Comment: ${comment}`
  );

  const updatedUserStory =
    await provider.addWorkItemComment(
      userStoryId,
      comment
    );

  console.log(
    "\n================================"
  );

  console.log(
    "COMMENT CREATED SUCCESSFULLY"
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

    version:
      updatedUserStory.version,

    status:
      updatedUserStory.status,
  });

} catch (error) {
  console.error(
    "\n================================"
  );

  console.error(
    "TAIGA COMMENT CREATION FAILED"
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