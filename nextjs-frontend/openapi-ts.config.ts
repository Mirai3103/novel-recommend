export default {
  input: 'http://localhost:8000/openapi.json',
  output: './lib/client',
  plugins: [
    {
      name: '@hey-api/client-next',
      runtimeConfigPath: '@/lib/api.ts', 
    },
  ],
};