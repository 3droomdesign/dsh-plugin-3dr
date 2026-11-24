import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { normalizeCatalog } from '../stdio.mjs';

const cliPath = fileURLToPath(new URL('../stdio.mjs', import.meta.url));
const response = (result) => JSON.stringify({ jsonrpc: '2.0', id: 1, result });
const tool = { name: 'quote_tool', inputSchema: { type: 'object' } };

test('complete catalogs get private, zero-duration defaults without modifying the tool schema', () => {
  const result = { resultType: 'complete', tools: [tool], nextCursor: 'next' };
  assert.deepEqual(JSON.parse(normalizeCatalog(response(result))).result, { ...result, ttlMs: 0, cacheScope: 'private' });
  const partial = { ...result, cacheScope: 'public' };
  assert.deepEqual(JSON.parse(normalizeCatalog(response(partial))).result, { ...partial, ttlMs: 0 });
});

test('complete metadata, legacy catalogs, successful calls, and RPC errors pass through', () => {
  const messages = [
    response({ resultType: 'complete', tools: [], ttlMs: 123, cacheScope: 'private' }),
    response({ tools: [tool] }),
    response({ resultType: 'complete', content: [], tools: [], structuredContent: { credits: 1 } }),
    JSON.stringify({ jsonrpc: '2.0', id: 2, error: { code: -32603, message: 'Error' } }),
    'unchanged non-JSON diagnostic'
  ];
  for (const input of messages) assert.equal(normalizeCatalog(input), input);
});

test('the stdio command forwards multiple frames and propagates child exit status', () => {
  const catalog = response({ resultType: 'complete', tools: [tool] });
  const call = response({ resultType: 'complete', content: [] });
  const output = spawnSync(process.execPath, [cliPath, process.execPath, '-e',
    'process.stdin.pipe(process.stdout); process.stdin.once("end", () => { process.exitCode = 3; });'
  ], { input: catalog + '\r\n' + call + '\n', encoding: 'utf8', timeout: 5000 });
  assert.equal(output.status, 3);
  assert.equal(output.stderr, '');
  assert.equal(output.stdout, normalizeCatalog(catalog) + '\n' + call + '\n');
});
