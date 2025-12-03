import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: 'http://localhost:3000/docs/json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/lib/api/generated',
      schemas: 'src/lib/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      baseUrl: 'http://localhost:3000',
      override: {
        mutator: {
          path: 'src/lib/api/axios-instance.ts',
          name: 'customAxiosInstance',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
