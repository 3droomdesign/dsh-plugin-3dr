import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createInterface } from 'node:readline';
import { pipeline } from 'node:stream/promises';
import { pathToFileURL } from 'node:url';

// MCP 2026-07-28 requires cache metadata on complete tool catalogs.
// Catalogs depend on the user's current grant and must be refreshed.
export function normalizeCatalog(line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    return line;
  }
  const result = message?.result;
  if (message?.jsonrpc !== '2.0' || !Object.hasOwn(message, 'id') || message.error ||
      result?.resultType !== 'complete' || !Array.isArray(result.tools) || Object.hasOwn(result, 'content')) {
    return line;
  }
  if (result.ttlMs !== undefined && result.cacheScope !== undefined) return line;
  result.ttlMs ??= 0;
  result.cacheScope ??= 'private';
  return JSON.stringify(message);
}

async function relay(command, args) {
  const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'inherit'], windowsHide: true });
  const ended = once(child, 'close');
  const stop = () => child.kill();
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
  process.stdin.pipe(child.stdin);
  child.stdin.on('error', (error) => {
    if (error.code !== 'EPIPE') {
      console.error('3DR connection input closed:', error.message);
      stop();
    }
  });

  async function* replies() {
    for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
      yield normalizeCatalog(line) + '\n';
    }
  }
  try {
    const [[code, signal]] = await Promise.all([ended, pipeline(replies(), process.stdout)]);
    process.exitCode = code ?? (signal ? 1 : 0);
  } finally {
    process.stdin.unpipe(child.stdin);
    process.stdin.pause();
    stop();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, ...args] = process.argv.slice(2);
  relay(command, args).catch((error) => {
    console.error('3DR could not start the local MCP connection:', error.message);
    process.exitCode = 1;
  });
}
