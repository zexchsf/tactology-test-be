import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadService } from './upload.service';
import { UploadResolver } from './upload.resolver';
import { File } from './file.entity';
import { MinioService } from './minio.service';
import { PubSubModule } from '../pubsub/pubsub.module';
import { CommonAuthModule } from '../common/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([File]), PubSubModule, CommonAuthModule],
  providers: [UploadResolver, UploadService, MinioService],
  exports: [UploadService],
})
export class UploadModule {}
