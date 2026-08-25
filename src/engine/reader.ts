import { readFile } from "node:fs/promises";

export interface FileReadOk {
  ok: true;
  text: string;
}

export interface FileReadError {
  ok: false;
  error: string;
}

export type FileReadResult = FileReadOk | FileReadError;

function looksBinary(bytes: Uint8Array): boolean {
  const sampleLen = Math.min(bytes.length, 8192);
  for (let i = 0; i < sampleLen; i++) {
    if (bytes[i] === 0) return true;
  }
  return false;
}

export async function readFileForCheck(filePath: string): Promise<FileReadResult> {
  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch {
    return { ok: false, error: `file not found: ${filePath}` };
  }
  const bytes = new Uint8Array(buffer);
  if (looksBinary(bytes)) {
    return { ok: false, error: `file is binary or not decodable as text: ${filePath}` };
  }
  const text = new TextDecoder("utf-8").decode(bytes);
  return { ok: true, text };
}
