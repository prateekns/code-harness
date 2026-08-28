import { checkpointer } from "./index.js";

let initialized = false;

export async function initializeGraph() {
  if (initialized) {
    return;
  }

  await checkpointer.setup();

  initialized = true;
}