import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'access' })
export class AccessEntity {
  @PrimaryColumn({ type: 'varchar', length: 120, unique: true })
  uuid!: string;

  @ManyToOne(() => UserEntity, (user) => user.sessions)
  user!: UserEntity;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;

  @Exclude()
  @Column({ type: 'varchar', length: 120 })
  public userAgent!: string;

  @Column({ type: 'varchar', length: 120 })
  public ip!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  public operationSystem?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  public systemVersion?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  public systemFamily?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  public clientName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  public clientVersion?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  public browser?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  public browserVersion?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  public browserFamily?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  public deviceBrand?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  public deviceModel?: string;
}
