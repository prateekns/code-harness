import "dotenv/config";

import {
  generateText,
} from "./index.js";

try {
  const result =
    await generateText({
      system:
        "You are a helpful software engineering assistant.",

      user:
        "Explain in one sentence what a Node.js service layer is.",
    });

  console.log(
    "\n=============================="
  );

  console.log(
    "OPENROUTER TEST RESULT"
  );

  console.log(
    "==============================\n"
  );

  console.log(result);

} catch (error) {
  console.error(
    "\n================================"
  );

  console.error(
    "LLM REQUEST FAILED"
  );

  console.error(
    "================================\n"
  );

  console.error(
    `Reason: ${error.message}`
  );

  console.error(
    `Code: ${error.code}`
  );

  console.error(
    `Provider: ${error.provider}`
  );

  console.error(
    `Model: ${error.model}`
  );

  console.error(
    `Retryable: ${error.retryable ? "Yes" : "No"}`
  );

  if (error.statusCode) {
    console.error(
      `HTTP Status: ${error.statusCode}`
    );
  }

  console.error();
}


/*import "dotenv/config";

import {
  generateText,
} from "./index.js";

const result =
  await generateText({
    system:
      "You are a helpful software engineering assistant.",

    user:
      "Explain in one sentence what a Node.js service layer is.",
  });

console.log(
  "\n=============================="
);

console.log(
  "OPENROUTER TEST RESULT"
);

console.log(
  "==============================\n"
);

console.log(result);*/


/*import "dotenv/config";

import { createLLM } from "./index.js";

const llm = createLLM();

const response = await llm.chat.completions.create({
  model: process.env.LLM_MODEL,
  messages: [
    {
      role: "user",
      content: "Explain what an API is in one sentence.",
    },
  ],
});

console.log(response.choices[0].message.content);*/