import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('user_credentials')
export class UserCredentials {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    nullable: false,
  })
  hashedPassword: string;

  @Column({
    default: false,
  })
  isLocked: boolean;

  @Column({
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastPasswordChangedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.userId = uuidv4();
  }
}
