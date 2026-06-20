import { Controller, Get, Param, Res, UseGuards, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Only allow safe filenames: hex chars + allowed extensions, no path traversal
const SAFE_FILENAME = /^[a-f0-9]+\.(jpg|jpeg|png|webp|gif)$/i;

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  @Get(':filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    if (!SAFE_FILENAME.test(filename)) {
      throw new NotFoundException();
    }

    const filePath = join(process.cwd(), 'uploads', filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException();
    }

    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(filePath);
  }
}
