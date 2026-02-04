import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { User } from './user.entity';
import { CommonAuthModule } from '../common/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CommonAuthModule],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
