import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { MetricModule } from './metric/metric.module';
import { PubSubModule } from './pubsub/pubsub.module';
import { CommonAuthModule } from './common/auth.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().default('1h'),
        MINIO_ENDPOINT: Joi.string().required(),
        MINIO_PORT: Joi.number().default(9000),
        MINIO_ACCESS_KEY: Joi.string().required(),
        MINIO_SECRET_KEY: Joi.string().required(),
        MINIO_BUCKET: Joi.string().default('uploads'),
        MINIO_USE_SSL: Joi.boolean().default(false),
        MAX_FILE_SIZE: Joi.number().default(52428800),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(__dirname, 'schema.gql'),
      playground: true,
      installSubscriptionHandlers: true,
      // Disable CSRF prevention to allow file uploads with multipart/form-data
      // For production, consider enabling CSRF with proper client-side headers
      // (x-apollo-operation-name or apollo-require-preflight)
      csrfPrevention: false,
      context: ({ req, connection }) => {
        if (connection) {
          return connection.context;
        }
        return { user: req.user };
      },
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: any) => {
            console.log('WebSocket client connected');
            return context;
          },
        },
      },
    }),
    PubSubModule,
    CommonAuthModule,
    AuthModule,
    UserModule,
    UploadModule,
    MetricModule,
  ],
})
export class AppModule { }
