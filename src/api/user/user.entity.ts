import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { SessionEntity } from '../auth/refresh-token/session.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryColumn({ unique: true })
  public uuid!: string;

  @Column({ type: 'varchar', length: 120 })
  public name!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  public email!: string;

  @Exclude()
  @Column({ type: 'varchar', length: 120 })
  public password!: string;

  @Column({ type: 'boolean', default: false })
  public isDeleted: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;

  @OneToMany(() => SessionEntity, (session) => session.user)
  public sessions!: [SessionEntity];
}
