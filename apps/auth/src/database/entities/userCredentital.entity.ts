import { UserRole } from '@libs/contracts/auth/types/user-role.type';
import {
  Column,
  CreateDateColumn,
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
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn({ type: 'date', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'date', name: 'updated_at' })
  updatedAt: Date;

  constructor(userId: string, hashedPassword: string, role?: UserRole) {
    this.userId = userId;
    this.hashedPassword = hashedPassword;
    this.role = role || UserRole.USER;
  }
}
