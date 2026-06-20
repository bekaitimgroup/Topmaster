import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_EXTS  = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export function imageUploadOptions(maxFiles: number, fieldName: string) {
  return {
    storage: diskStorage({
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
