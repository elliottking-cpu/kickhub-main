// types/roles.ts - Complete TypeScript role definitions for RBAC system

/**
 * All possible user roles in the KickHub system
 */
export type UserRole = 
  | 'super_admin'
  | 'admin' 
  | 'club_official'
  | 'coach'
  | 'assistant_coach'
  | 'parent'
  | 'player'
  | 'fan'
  | 'referee';

/**
 * Route patterns for access control
 */
export type RoutePattern = 
  | '/coach'
  | '/parent'
  | '/player'
  | '/fan'
  | '/referee'
  | '/club';

/**
 * User with multiple roles - supports multi-role users
 */
export interface MultiRoleUser {
  id: string;
  email: string;
  roles: UserRole[];
  active_roles: UserRole[];
  team_associations?: {
    team_id: string;
    role: UserRole;
    is_active: boolean;
  }[];
}

/**
 * Role hierarchy mapping - defines which roles inherit permissions from others
 */
export interface RoleHierarchy {
  [key: string]: UserRole[];
}

/**
 * Access control matrix - defines which roles can access which routes
 */
export interface AccessMatrix {
  [route: string]: UserRole[];
}

/**
 * Permission check result
 */
export interface PermissionResult {
  hasAccess: boolean;
  allowedRoles: UserRole[];
  userRoles: UserRole[];
  route: string;
}

/**
 * Route access check result
 */
export interface PermissionCheckResult {
  hasAccess: boolean;
  reason?: string;
}

/**
 * RBAC configuration interface
 */
export interface RBACConfig {
  enabled: boolean;
  role_hierarchy: RoleHierarchy;
  access_matrix: AccessMatrix;
  unified_permissions: {
    coach_inherits_parent: boolean;
    assistant_inherits_parent: boolean;
    multi_role_support: boolean;
  };
}

/**
 * Database user role record
 */
export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  team_id?: string;
  is_active: boolean;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
}