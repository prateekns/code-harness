import { openrouter } from "./openrouter.js";

import {
  normalizeLLMError,
} from "./errors.js";

import {
  logger,
} from "../utils/logger.js";

const provider =
  process.env.LLM_PROVIDER ||
  "openrouter";

const model =
  process.env.LLM_MODEL ||
  "deepseek/deepseek-chat";

export async function generateText({
  system,
  user,
}) {
  if (provider !== "openrouter") {
    const error =
      normalizeLLMError({
        error: new Error(
          `Unsupported LLM provider: ${provider}`
        ),

        provider,

        model,
      });

    logger.error(
      error.message,
      {
        code: error.code,
        provider: error.provider,
        model: error.model,
      }
    );

    throw error;
  }

  try {
    logger.info(
      "Sending request to LLM provider",
      {
        provider,
        model,
      }
    );

    const response =
      await openrouter.chat.send({
        chatRequest: {
          model,

          messages: [
            {
              role: "system",
              content: system,
            },

            {
              role: "user",
              content: user,
            },
          ],
        },
      });

    const content =
      response
        ?.choices?.[0]
        ?.message
        ?.content;

    if (!content) {
      throw new Error(
        "LLM provider returned an empty response."
      );
    }

    logger.info(
      "LLM request completed successfully",
      {
        provider,
        model,
      }
    );

    return content;
  } catch (rawError) {
    const error =
      normalizeLLMError({
        error: rawError,
        provider,
        model,
      });

    /*
     * Technical error goes to logs.
     */
    logger.error(
      "LLM request failed",
      {
        code: error.code,
        provider: error.provider,
        model: error.model,
        statusCode: error.statusCode,
        retryable: error.retryable,

        /*
         * Keep the raw error available in logs,
         * but do not expose it to the user.
         */
        cause:
          error.cause?.message ||
          String(error.cause),
      }
    );

    /*
     * User/workflow receives the clean
     * normalized error.
     */
    throw error;
  }
}



/*import { openrouter } from "./openrouter.js";

const provider =
  process.env.LLM_PROVIDER || "openrouter";

const model =
  process.env.LLM_MODEL ||
  "deepseek/deepseek-chat";

export async function generateText({
  system,
  user,
}) {
  if (provider !== "openrouter") {
    throw new Error(
      `Unsupported LLM provider: ${provider}`
    );
  }

  const response =
    await openrouter.chat.send({
      chatRequest: {
        model,

        messages: [
          {
            role: "system",
            content: system,
          },
          {
            role: "user",
            content: user,
          },
        ],
      },
    });

  return (
    response.choices?.[0]?.message
      ?.content || ""
  );
}*/


/*import OpenAI from "openai";

const provider = process.env.LLM_PROVIDER || "deepseek";

function createDeepSeekClient() {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });
}

export function createLLM() {
  switch (provider) {
    case "deepseek":
      return createDeepSeekClient();

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}*/