import { EUserRole } from '@libs/contracts/auth/enums';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_credentials')
export class UserCredential {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({
    nullable: false,
    name: 'hashed_password',
  })
  hashedPassword: string;

  @Column({
    type: 'enum',
    enum: EUserRole,
    default: EUserRole.USER,
  })
  role: EUserRole;

  @CreateDateColumn({ type: 'date', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'date', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  constructor(userId: string, hashedPassword: string, role?: EUserRole) {
    this.userId = userId;
    this.hashedPassword = hashedPassword;
    this.role = role || EUserRole.USER;
  }
}
