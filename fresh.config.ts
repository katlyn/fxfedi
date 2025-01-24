import { defineConfig } from "$fresh/server.ts";
import { configure, getConsoleSink } from "@logtape/logtape";
import { AsyncLocalStorage } from "node:async_hooks";

await configure({
  sinks: { console: getConsoleSink() },
  loggers: [
    { category: "your-app", sinks: ["console"], lowestLevel: "debug" },
    { category: "fedify", sinks: ["console"], lowestLevel: "debug" },
  ],

  contextLocalStorage: new AsyncLocalStorage(),
});

export default defineConfig({});
