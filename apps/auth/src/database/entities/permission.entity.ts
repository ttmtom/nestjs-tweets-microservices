import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  permissionId: string;

  @Column({ unique: true, nullable: false })
  permissionName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor() {
    if (!this.permissionId) {
      this.permissionId = uuidv4();
    }
  }
}
