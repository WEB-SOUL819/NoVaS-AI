
export type UserRole = 'user' | 'admin' | 'owner';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export const USER_PERMISSIONS: Permission[] = [
  { id: 'use_assistant', name: 'Use Assistant', description: 'Can use the AI assistant' },
  { id: 'save_conversations', name: 'Save Conversations', description: 'Can save conversations' },
  { id: 'edit_profile', name: 'Edit Profile', description: 'Can edit own profile' },
];

export const ADMIN_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  { id: 'view_all_users', name: 'View Users', description: 'Can view all users' },
  { id: 'manage_modules', name: 'Manage Modules', description: 'Can manage system modules' },
  { id: 'view_logs', name: 'View Logs', description: 'Can view system logs' },
];

export const OWNER_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  { id: 'manage_system', name: 'Manage System', description: 'Can manage entire system' },
  { id: 'manage_roles', name: 'Manage Roles', description: 'Can manage user roles' },
  { id: 'dev_tools', name: 'Developer Tools', description: 'Access to developer tools' },
];

export const ROLE_PERMISSIONS: RolePermissions[] = [
  { role: 'user', permissions: USER_PERMISSIONS },
  { role: 'admin', permissions: ADMIN_PERMISSIONS },
  { role: 'owner', permissions: OWNER_PERMISSIONS },
];

export function hasPermission(userRole: UserRole | undefined, permissionId: string): boolean {
  if (!userRole) return false;
  
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === userRole);
  if (!rolePermissions) return false;
  
  return rolePermissions.permissions.some(p => p.id === permissionId);
}
