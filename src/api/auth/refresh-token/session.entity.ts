import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user/user.entity';
import { Exclude, Expose } from 'class-transformer';
import DeviceDetector from 'node-device-detector';

const detector = new DeviceDetector();

@Entity({ name: 'sessions' })
export class SessionEntity {
  @PrimaryColumn({ unique: true })
  public uuid!: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, unique: true })
  public refreshToken!: string;

  @ManyToOne(() => UserEntity, (user) => user.sessions)
  public user!: UserEntity;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  public userAgent!: string;

  @Expose()
  public get deviceInfo() {
    return detector.detect(this.userAgent);
  }
}
