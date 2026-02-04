import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { ReadStream } from 'fs';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: this.configService.get<number>('MINIO_PORT') || 9000,
      useSSL: this.configService.get<boolean>('MINIO_USE_SSL') || false,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') || '',
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') || '',
    });
  }

  async uploadFile(
    bucketName: string,
    objectName: string,
    stream: ReadStream,
    size: number,
    mimetype: string,
  ): Promise<void> {
    // Ensure bucket exists
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(bucketName, 'us-east-1');
    }

    // Upload file
    await this.minioClient.putObject(bucketName, objectName, stream, size, {
      'Content-Type': mimetype,
    });
  }

  async deleteFile(bucketName: string, objectName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, objectName);
  }

  getObjectUrl(bucketName: string, objectName: string): string {
    return `minio://${bucketName}/${objectName}`;
  }
}
