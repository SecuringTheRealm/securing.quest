/**
 * Shared JSON file helpers for the webmention scripts.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

export async function readJson(path, fallback = {}) {
  try {
    return JSON.parse(await readFile(path, 'utf-8'))
  } catch {
    return fallback
  }
}

export async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8')
}
