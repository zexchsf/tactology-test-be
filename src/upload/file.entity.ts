import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../user/user.entity';

@ObjectType()
@Entity('files')
export class File {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Field()
  @Column()
  originalName: string;

  @Field()
  @Column()
  storagePath: string;

  @Field()
  @Column()
  mimeType: string;

  @Field()
  @Column('bigint')
  sizeBytes: number;

  @Field()
  @CreateDateColumn()
  uploadedAt: Date;
}
