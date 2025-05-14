import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  rolePermissionsId: string;

  @ManyToOne(() => Role, (role) => role.roleId)
  @JoinColumn({ name: 'role_id', referencedColumnName: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.permissionId)
  @JoinColumn({ name: 'permission_id', referencedColumnName: 'permission_id' })
  permission: Permission;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
