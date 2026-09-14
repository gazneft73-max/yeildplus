import "server-only";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Private file storage on Cloudflare R2 (KYC documents, deposit proofs).
 * R2 exposes the S3 API, so the AWS S3 client is the official way to talk to it.
 * Files are never public: uploads and downloads both go through short-lived presigned URLs.
 */

let client: S3Client | null = null;

export const isStorageConfigured = () =>
  Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);

function r2() {
  if (!isStorageConfigured()) throw new Error("File storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET.");
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
    });
  }
  return client;
}

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_BYTES = 10 * 1024 * 1024;

export async function presignUpload(opts: { uid: string; folder: string; contentType: string; size: number; filename: string }) {
  if (!ALLOWED.has(opts.contentType)) throw new Error("Only JPG, PNG, WEBP or PDF files are allowed.");
  if (opts.size > MAX_BYTES) throw new Error("File must be 10 MB or smaller.");
  const ext = opts.filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const key = `${opts.folder}/${opts.uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const cmd = new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: opts.contentType, ContentLength: opts.size });
  const url = await getSignedUrl(r2(), cmd, { expiresIn: 300 });
  return { key, url };
}

export async function presignView(key: string) {
  const cmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key });
  return getSignedUrl(r2(), cmd, { expiresIn: 600 });
}
