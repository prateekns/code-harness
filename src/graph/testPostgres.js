import "dotenv/config";

import { checkpointer } from "./index.js";

console.log("Setting up LangGraph PostgreSQL checkpointer...");

await checkpointer.setup();

console.log("PostgreSQL checkpointer is ready.");