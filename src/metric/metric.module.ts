import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricService } from './metric.service';
import { MetricResolver } from './metric.resolver';
import { File } from '../upload/file.entity';
import { CommonAuthModule } from '../common/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([File]), CommonAuthModule],
  providers: [MetricResolver, MetricService],
})
export class MetricModule {}
