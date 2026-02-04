import { Test, TestingModule } from '@nestjs/testing';
import { MetricResolver } from './metric.resolver';
import { MetricService } from './metric.service';

describe('MetricResolver', () => {
  let resolver: MetricResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricResolver, MetricService],
    }).compile();

    resolver = module.get<MetricResolver>(MetricResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
