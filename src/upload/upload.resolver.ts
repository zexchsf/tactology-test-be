import { Resolver, Mutation, Query, Subscription, Args } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { UploadService } from './upload.service';
import { File } from './file.entity';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import type { FileUpload } from 'graphql-upload/GraphQLUpload.mjs';

@Resolver(() => File)
export class UploadResolver {
  constructor(
    private readonly uploadService: UploadService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) { }

  @Mutation(() => File)
  @UseGuards(JwtAuthGuard)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
    @CurrentUser() user: User,
  ): Promise<File> {
    return this.uploadService.handleUpload(file, user);
  }

  @Query(() => [File])
  @UseGuards(JwtAuthGuard)
  async myFiles(                                                                                                                                              
    @Args('limit', { type: () => Number, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Number, defaultValue: 0 }) offset: number,
    @CurrentUser() user: User,
  ): Promise<File[]> {
    const { files } = await this.uploadService.getFiles(user.id, limit, offset);
    return files;
  }

  @Subscription(() => File, {
    filter: (payload, _args, context) =>
      payload.fileUploaded.userId === context.user.id,
    resolve: (payload) => payload.fileUploaded.file,
  })
  @UseGuards(JwtAuthGuard)
  fileUploaded(@CurrentUser() _user: User) {
    return (this.pubSub as any).asyncIterator(['FILE_UPLOADED']);
  }
}
