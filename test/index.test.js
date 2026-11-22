import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, rm, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { cwd } from 'node:process';

const cliPath = resolve(cwd(), 'src', 'index.js');

test('CLI creates files and directories from config', async (t) => {
  const tempDir = resolve(cwd(), 'tmp-test');
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });

  const config = {
    actions: [
      { type: 'dir', path: 'src/components' },
      { type: 'file', path: 'src/components/hello.js', content: 'console.log("Hello");' },
      { type: 'file', path: 'README.generated.md', content: '# Generated' }
    ]
  };

  const configPath = join(tempDir, 'config.json');
  await writeFile(configPath, JSON.stringify(config));

  const result = spawnSync('node', [cliPath, configPath], { cwd: tempDir, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, 'CLI should exit with code 0');

  const createdFile = join(tempDir, 'src/components/hello.js');
  const fileContent = await readFile(createdFile, 'utf8');
  assert.match(fileContent, /Hello/);

  const readmePath = join(tempDir, 'README.generated.md');
  const readmeContent = await readFile(readmePath, 'utf8');
  assert.ok(readmeContent.includes('Generated'));

  await rm(tempDir, { recursive: true, force: true });
});
