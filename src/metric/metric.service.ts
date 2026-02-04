import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../upload/file.entity';
import { UploadMetrics } from './metric.type';

@Injectable()
export class MetricService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) { }

  async getMetrics(userId: string): Promise<UploadMetrics> {
    const result = await this.fileRepository
      .createQueryBuilder('file')
      .where('file.userId = :userId', { userId })
      .select('COUNT(*)', 'totalFiles')
      .addSelect('COALESCE(SUM(file.sizeBytes), 0)', 'totalStorageBytes')
      .addSelect(
        `COUNT(*) FILTER (WHERE CAST(file."uploadedAt" AS date) = CURRENT_DATE)`,
        'uploadsToday',
      )
      .getRawOne();

    return {
      totalFiles: parseInt(result?.totalFiles || '0', 10),
      totalStorageBytes: parseInt(result?.totalStorageBytes || '0', 10),
      uploadsToday: parseInt(result?.uploadsToday || '0', 10),
    };
  }
}
