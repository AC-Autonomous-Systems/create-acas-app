import { exec } from 'child_process';
import * as http from 'http';
import path from 'path';

const parentDir = path.resolve(__dirname, '..');

const setup = async () => {
  exec('npx tsx test/seed.setup.ts', { cwd: parentDir });

  // Check if server is already running:
  // const check = http.get('http://localhost:3001', (res) => {
  //   console.log('post response', res);

  //   if (res.statusCode === 200) {
  //     console.log('Server is already running');
  //     (global as any)['__SERVER__'] = server;
  //     process.exit(0);
  //   } else {
  //     console.log('Server not running');
  //   }
  // });

  const server = exec('next dev --port 3001', { cwd: parentDir });
  if (!server || !server.stdout || !server.stderr) {
    throw new Error('Server not started');
  }
  // Type assertion to inform TypeScript about the existence of __SERVER__
  (global as any)['__SERVER__'] = server;

  server.stdout.on('data', (data) => {
    console.log(`server: ${data}`);
  });

  server.stderr.on('data', (data) => {
    console.error(`server error: ${data}`);
  });

  const checkServerReady = () => {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        http
          .get('http://localhost:3001', (res) => {
            if (res.statusCode === 200) {
              clearInterval(interval);
              resolve();
            }
          })
          .on('error', () => {
            // Server is not ready yet
          });
      }, 1000);
    });
  };

  await checkServerReady();
};

export default setup;
