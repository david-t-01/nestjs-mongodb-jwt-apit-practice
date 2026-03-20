import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';

@Injectable()
export class StorageService {
  private readonly uploadDir = join(process.cwd(), 'public', 'products-bucket');

  async saveFile(file: Express.Multer.File): Promise<string> {
    await mkdir(this.uploadDir, { recursive: true });

    const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
    const filePath = join(this.uploadDir, uniqueName);

    await writeFile(filePath, file.buffer);

    return uniqueName;
  }
}
