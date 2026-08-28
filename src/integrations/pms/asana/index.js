import { AsanaClient } from "./client.js";

export const asana = new AsanaClient({
  accessToken: process.env.ASANA_ACCESS_TOKEN,
});