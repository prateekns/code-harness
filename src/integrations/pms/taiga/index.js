import {
  TaigaClient,
} from "./client.js";

import {
  TaigaProvider,
} from "./provider.js";

export function createTaigaClient() {

  return new TaigaClient({
    baseUrl:
      process.env.TAIGA_BASE_URL,

    authToken:
      process.env.TAIGA_AUTH_TOKEN,
  });
}


export function createTaigaProvider() {

  const client =
    createTaigaClient();

  return new TaigaProvider(
    client
  );
}


/*import {
  TaigaClient,
} from "./client.js";

import {
  TaigaProvider,
} from "./provider-bkp.js";

export function createTaigaClient() {
  return new TaigaClient({
    baseUrl:
      process.env.TAIGA_BASE_URL,

    authToken:
      process.env.TAIGA_AUTH_TOKEN,
  });
}

export function createTaigaProvider() {
  const client =
    createTaigaClient();

  return new TaigaProvider(
    client
  );
}*/