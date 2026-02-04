    import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UploadMetrics {
  @Field()
  totalFiles: number;

  @Field()
  totalStorageBytes: number;

  @Field()
  uploadsToday: number;
}
