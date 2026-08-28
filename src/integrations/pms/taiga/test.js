import "dotenv/config";

import {
  createTaigaClient,
} from "./index.js";

try {
  const taiga =
    createTaigaClient();

  /*
   * /users/me is useful for verifying
   * that our authentication works.
   */
  const user =
    await taiga.request(
      "/users/me"
    );

  console.log(
    "\n================================"
  );

  console.log(
    "TAIGA AUTHENTICATION SUCCESS"
  );

  console.log(
    "================================\n"
  );

  console.log(
    "Authenticated Taiga user:"
  );

  console.log({
    id: user?.id,
    username: user?.username,
    fullName: user?.full_name,
    email: user?.email,
  });

} catch (error) {
  console.error(
    "\n================================"
  );

  console.error(
    "TAIGA CONNECTION FAILED"
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