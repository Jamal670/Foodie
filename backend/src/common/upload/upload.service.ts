import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly supabase: SupabaseClient;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_KEY');
    const bucketName = this.configService.get<string>(
      'SUPABASE_CATEGORY_BUCKET',
    );

    if (!url || !key || !bucketName) {
      throw new Error('Supabase configuration missing');
    }

    this.bucketName = bucketName;
    this.supabase = createClient(url, key);
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'restaurants',
  ): Promise<string> {
    const extension = file.originalname.split('.').pop();

    const filePath = `${folder}/${randomUUID()}.${extension}`;

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return this.supabase.storage.from(this.bucketName).getPublicUrl(filePath)
      .data.publicUrl;
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder = 'restaurants',
  ): Promise<string[]> {
    if (!files?.length) {
      return [];
    }

    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }
}
