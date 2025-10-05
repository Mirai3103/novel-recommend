import { defineConfig } from "orval";

export default defineConfig({
  novel: {
    input: "http://localhost:8000/openapi.json",
    output: {
      mode: "tags",
      target: "./lib/client/client.ts",
      client: "fetch",
      baseUrl: "http://localhost:8000",
      override: {
        mutator: {
          path: './lib/api.ts',
          name: 'customFetch',
        },
        fetch:{
          includeHttpResponseReturnType :false,
          
        }
      },
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
});
