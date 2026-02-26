import { randomUUID } from "crypto";
import { DeleteObjectCommand, S3Client, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import AppError from "../../helpers/appError.js";

const DEFAULT_TTL_SECONDS = 900;

const cleanBaseEndpoint = () => {
  const raw = String(process.env.R2_S3_ENDPOINT || "").trim();
  if (!raw) return "";

  const withoutSlash = raw.replace(/\/+$/, "");
  const bucket = String(process.env.R2_BUCKET || "").trim();
  if (!bucket) return withoutSlash;

  const bucketSuffix = `/${bucket}`;
  if (withoutSlash.endsWith(bucketSuffix)) {
    return withoutSlash.slice(0, -bucketSuffix.length);
  }

  return withoutSlash;
};

const getSignedUrlTtl = () => {
  const parsed = Number.parseInt(process.env.R2_SIGNED_URL_TTL_SECONDS || "", 10);
  if (!Number.isInteger(parsed) || parsed < 60) {
    return DEFAULT_TTL_SECONDS;
  }
  return parsed;
};

const ensureConfigured = () => {
  const endpoint = cleanBaseEndpoint();
  const bucket = String(process.env.R2_BUCKET || "").trim();
  const accessKeyId = String(process.env.R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = String(process.env.R2_SECRET_ACCESS_KEY || "").trim();

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new AppError("R2 storage is not configured", 500);
  }

  return { endpoint, bucket, accessKeyId, secretAccessKey };
};

const createClient = () => {
  const { endpoint, accessKeyId, secretAccessKey } = ensureConfigured();
  return new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

const preserveFilename = (filename = "file") => {
  const baseName = String(filename || "file")
    .split(/[\\/]/)
    .pop()
    ?.trim();

  const noControlChars = String(baseName || "file").replace(/[\u0000-\u001F\u007F]/g, "");
  return noControlChars || "file";
};

export const isR2Configured = () => {
  try {
    ensureConfigured();
    return true;
  } catch {
    return false;
  }
};

export const buildObjectKey = ({ userId, filename, prefix = "pending" }) => {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeName = preserveFilename(filename);
  const uuid = randomUUID();
  return `${prefix}/${userId}/${year}/${month}/${uuid}/${safeName}`;
};

export const getUploadUrl = async ({ objectKey, mimeType }) => {
  const client = createClient();
  const { bucket } = ensureConfigured();
  const expiresIn = getSignedUrlTtl();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: mimeType || "application/octet-stream",
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  console.log(`[R2] Signed upload URL generated for key: ${objectKey}`);
  return { uploadUrl, expiresIn };
};

export const putObjectBuffer = async ({ objectKey, body, mimeType }) => {
  const client = createClient();
  const { bucket } = ensureConfigured();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    Body: body,
    ContentType: mimeType || "application/octet-stream",
  });

  await client.send(command);
  console.log(`[R2] Direct upload success for key: ${objectKey}`);
  return { objectKey };
};

export const headObject = async (objectKey) => {
  const client = createClient();
  const { bucket } = ensureConfigured();

  const command = new HeadObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  });

  const response = await client.send(command);
  console.log(
    `[R2] Head object success for key: ${objectKey}, size=${response?.ContentLength || 0}, type=${response?.ContentType || "unknown"}`
  );
  return response;
};

export const getDownloadUrl = async ({ objectKey, filename = null, forceDownload = false }) => {
  const client = createClient();
  const { bucket } = ensureConfigured();
  const expiresIn = getSignedUrlTtl();

  const dispositionName = filename ? preserveFilename(filename).replace(/["\\]/g, "_") : null;
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ...(dispositionName
      ? {
          ResponseContentDisposition: `${forceDownload ? "attachment" : "inline"}; filename="${dispositionName}"`,
        }
      : {}),
  });

  const downloadUrl = await getSignedUrl(client, command, { expiresIn });
  console.log(`[R2] Signed download URL generated for key: ${objectKey}`);
  return { downloadUrl, expiresIn };
};

export const getPublicObjectUrl = (objectKey) => {
  const base = String(process.env.R2_PUBLIC_BASE_URL || "").trim().replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/${objectKey}`;
};

export const getR2BucketName = () => String(process.env.R2_BUCKET || "").trim();

export const deleteObject = async (objectKey) => {
  const client = createClient();
  const { bucket } = ensureConfigured();

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  });

  await client.send(command);
  console.log(`[R2] Deleted object key: ${objectKey}`);
};
