import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MetricService } from './metric.service';
import { UploadMetrics } from './metric.type';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../user/user.entity';

@Resolver()
export class MetricResolver {
  constructor(private readonly metricService: MetricService) {}

  @Query(() => UploadMetrics)
  @UseGuards(JwtAuthGuard)
  async myUploadMetrics(@CurrentUser() user: User): Promise<UploadMetrics> {
    return this.metricService.getMetrics(user.id);
  }
}
