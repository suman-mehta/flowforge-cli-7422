#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { exit } from 'node:process';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: flowforge <config.json>');
    exit(1);
  }
  const configPath = resolve(process.cwd(), args[0]);
  let config;
  try {
    const raw = await readFile(configPath, 'utf8');
    config = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read or parse config:', e.message);
    exit(1);
  }
  if (!Array.isArray(config.actions)) {
    console.error('Config must contain an "actions" array.');
    exit(1);
  }
  for (const action of config.actions) {
    if (action.type === 'dir') {
      const dirPath = resolve(process.cwd(), action.path);
      await mkdir(dirPath, { recursive: true });
      console.log(`Created directory: ${action.path}`);
    } else if (action.type === 'file') {
      const filePath = resolve(process.cwd(), action.path);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, action.content ?? '');
      console.log(`Created file: ${action.path}`);
    } else {
      console.warn(`Unknown action type: ${action.type}`);
    }
  }
  console.log('Scaffolding complete.');
  exit(0);
}
await main();
