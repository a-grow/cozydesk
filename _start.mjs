import { createServer } from 'vite';

const server = await createServer({
  server: { port: 3000, host: true, strictPort: true },
  logLevel: 'info',
});

await server.listen();
server.printUrls();
process.stdout.write('\nSERVER_READY\n');
