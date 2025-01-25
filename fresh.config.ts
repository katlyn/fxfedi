import { defineConfig } from "$fresh/server.ts";
import { configure, getConsoleSink } from "@logtape/logtape";
import { AsyncLocalStorage } from "node:async_hooks";

await configure({
  sinks: { console: getConsoleSink() },
  filters: {},
  loggers: [
    {
      category: ["logtape", "meta"],
      sinks: ["console"],
      lowestLevel: "warning",
    },
  ],

  contextLocalStorage: new AsyncLocalStorage(),
});

export default defineConfig({});
