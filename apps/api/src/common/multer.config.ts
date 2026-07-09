import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_EXTS  = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

// ── S3-compatible storage (AWS S3, Cloudflare R2, MinIO, …) ─────────────────
//
// Railway (and most PaaS) containers have EPHEMERAL disks: every deploy wipes
// ./uploads. When the S3 env vars below are present we upload straight to
// object storage; otherwise we fall back to disk so local dev keeps working
// without any cloud credentials.
//
// Required env vars for S3 mode:
//   AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
//   and AWS_REGION (AWS) or S3_ENDPOINT (R2 / other S3-compatible).
// Optional: CDN_URL — public base URL used for returned file URLs.
//
// The packages `@aws-sdk/client-s3` and `multer-s3` are require()'d lazily so
// the app still builds and runs in disk mode when they are not installed.

export function isS3Enabled(): boolean {
  return Boolean(
    process.env.AWS_S3_BUCKET &&
    (process.env.AWS_REGION || process.env.S3_ENDPOINT),
  );
}

let cachedS3Storage: any = null;

function s3Storage(): any {
  if (cachedS3Storage) return cachedS3Storage;

  // Lazy require: only needed when S3 env vars are configured.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { S3Client } = require('@aws-sdk/client-s3');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const multerS3 = require('multer-s3');

  const client = new S3Client({
    // R2 and most S3-compatible providers accept any region string; 'auto' is
    // R2's convention. Credentials come from AWS_ACCESS_KEY_ID /
    // AWS_SECRET_ACCESS_KEY via the SDK's default provider chain.
    region: process.env.AWS_REGION ?? 'auto',
    ...(process.env.S3_ENDPOINT
      ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true }
      : {}),
  });

  cachedS3Storage = multerS3({
    s3: client,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req: any, file: Express.Multer.File, cb: (err: Error | null, key: string) => void) => {
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `uploads/${randomBytes(16).toString('hex')}${ext}`);
    },
  });
  return cachedS3Storage;
}

// Public URL for an uploaded file, regardless of storage backend.
// - S3 uploads (multer-s3 sets `key`/`location`): CDN_URL + key if CDN_URL is
//   set, otherwise the direct S3 object URL.
// - Disk uploads: the local authenticated /api/files/ route.
export function fileUrl(file: Express.Multer.File): string {
  const f = file as any;
  if (f.key) {
    const cdn = process.env.CDN_URL;
    if (cdn) return `${cdn.replace(/\/+$/, '')}/${f.key}`;
    return f.location;
  }
  return `/api/files/${file.filename}`;
}

export function imageUploadOptions(maxFiles: number, fieldName: string) {
  return {
    storage: isS3Enabled()
      ? s3Storage()
      : diskStorage({
          destination: './uploads',
          filename: (_req: any, file: Express.Multer.File, cb: (err: Error | null, name: string) => void) => {
            const ext = extname(file.originalname).toLowerCase();
            cb(null, `${randomBytes(16).toString('hex')}${ext}`);
          },
        }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
      files: maxFiles,
    },
    fileFilter: (_req: any, file: Express.Multer.File, cb: (err: Error | null, accept: boolean) => void) => {
      const ext = extname(file.originalname).toLowerCase();
      if (!ALLOWED_MIMES.has(file.mimetype) || !ALLOWED_EXTS.has(ext)) {
        return cb(
          new BadRequestException(`Faqat rasm fayllari qabul qilinadi (jpeg, png, webp, gif). "${file.originalname}" rad etildi.`),
          false,
        );
      }
      cb(null, true);
    },
  };
}
