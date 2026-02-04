import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { PubSub } from 'graphql-subscriptions';
import { File } from './file.entity';
import { User } from '../user/user.entity';
import { MinioService } from './minio.service';

interface Upload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(): NodeJS.ReadableStream;
}

@Injectable()
export class UploadService {
  private readonly maxFileSize: number;
  private readonly bucket: string;
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.ms-excel',
  ];

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private minioService: MinioService,
    private configService: ConfigService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE') || 52428800;
    this.bucket = this.configService.get<string>('MINIO_BUCKET') || 'uploads';
  }

  async handleUpload(file: Upload, user: User): Promise<File> {
    // Validate MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed`,
      );
    }

    const stream = file.createReadStream() as any;
    let uploadedBytes = 0;

    // Validate file size during streaming
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => {
        uploadedBytes += chunk.length;
        if (uploadedBytes > this.maxFileSize) {
          if (typeof stream.destroy === 'function') {
            stream.destroy();
          }
          reject(
            new BadRequestException(
              `File size exceeds limit of ${this.maxFileSize} bytes`,
            ),
          );
        }
      });

      stream.on('end', async () => {
        try {
          const fileId = uuidv4();
          const ext = this.getFileExtension(file.filename);
          const storagePath = `${user.id}/${fileId}.${ext}`;

          // Reset stream for upload
          const uploadStream = file.createReadStream() as any;
          await this.minioService.uploadFile(
            this.bucket,
            storagePath,
            uploadStream,
            uploadedBytes,
            file.mimetype,
          );

          // Save file metadata to database
          const savedFile = await this.fileRepository.save({
            userId: user.id,
            originalName: file.filename,
            storagePath,
            mimeType: file.mimetype,
            sizeBytes: uploadedBytes,
          });

          // Publish event
          await this.pubSub.publish('FILE_UPLOADED', {
            fileUploaded: {
              file: savedFile,
              userId: user.id,
            },
          });

          resolve(savedFile);
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  async getFiles(userId: string, limit = 10, offset = 0): Promise<{
    files: File[];
    total: number;
  }> {
    const [files, total] = await this.fileRepository.findAndCount({
      where: { userId },
      order: { uploadedAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { files, total };
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || 'bin';
  }
}
