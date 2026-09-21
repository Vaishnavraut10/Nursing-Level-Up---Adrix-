import 'server-only';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Object storage for uploaded documents and extracted text (Architecture doc §6).
// Cloudflare R2 via the S3 API in production; a local folder in development when R2 isn't configured.

const r2Configured = () =>
  Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME);

let client: S3Client | null = null;
function s3() {
  client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
  });
  return client;
}

const LOCAL_ROOT = path.join(process.cwd(), '.uploads');

function localPath(key: string) {
  const resolved = path.resolve(LOCAL_ROOT, key);
  // Keys are generated server-side, but guard against traversal anyway.
  if (!resolved.startsWith(LOCAL_ROOT + path.sep)) throw new Error('Invalid storage key');
  return resolved;
}

function assertStorageAvailable() {
  if (!r2Configured() && process.env.NODE_ENV === 'production') {
    throw new Error('R2 storage is not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME)');
  }
}

export function storageBackend() {
  return r2Configured() ? 'r2' : 'local';
}

export async function uploadFile(key: string, body: Buffer, contentType: string) {
  assertStorageAvailable();
  if (r2Configured()) {
    await s3().send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, Body: body, ContentType: contentType }));
    return;
  }
  const file = localPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
}

export async function getFile(key: string): Promise<Buffer> {
  if (r2Configured()) {
    const res = await s3().send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
    return Buffer.from(await res.Body!.transformToByteArray());
  }
  return readFile(localPath(key));
}

export async function deleteFile(key: string) {
  if (r2Configured()) {
    await s3().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
    return;
  }
  await rm(localPath(key), { force: true });
}
