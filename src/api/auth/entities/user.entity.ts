import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { AccessEntity } from './access.entity';

@Entity('users')
export class UserEntity {
  @PrimaryColumn({ type: 'varchar', length: 120, unique: true })
  public uuid!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  public email!: string;

  @Column({ type: 'boolean', default: false })
  public emailConfirmed: boolean;

  @Exclude()
  @Column({ type: 'varchar', length: 120 })
  public password!: string;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;

  @Exclude()
  @OneToMany(() => AccessEntity, (access) => access.user)
  public sessions!: AccessEntity[];
}
