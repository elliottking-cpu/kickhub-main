/**
 * Unified Permission System
 * 
 * This file provides role-based access control (RBAC) and permission management
 * for the KickHub application, handling multi-role users and permission inheritance.
 */

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  name: string;
  permissions: Permission[];
  inherits?: string[]; // Roles this role inherits from
}

export interface UserContext {
  userId: string;
  roles: string[];
  teamIds?: string[];
  clubIds?: string[];
}

/**
 * Define role hierarchy and permissions
 */
export const ROLES: Record<string, Role> = {
  // Base roles
  fan: {
    name: 'fan',
    permissions: [
      { resource: 'match', action: 'view' },
      { resource: 'player_stats', action: 'view' },
      { resource: 'team_info', action: 'view' },
    ]
  },
  
  player: {
    name: 'player',
    inherits: ['fan'],
    permissions: [
      { resource: 'own_profile', action: 'view' },
      { resource: 'own_profile', action: 'edit' },
      { resource: 'training_content', action: 'view' },
      { resource: 'achievements', action: 'view' },
    ]
  },
  
  parent: {
    name: 'parent',
    inherits: ['fan'],
    permissions: [
      { resource: 'child_profile', action: 'view' },
      { resource: 'child_profile', action: 'edit' },
      { resource: 'child_stats', action: 'view' },
      { resource: 'payments', action: 'manage' },
      { resource: 'team_communication', action: 'view' },
      { resource: 'match_stats', action: 'record', conditions: { assigned: true } },
    ]
  },
  
  assistant_coach: {
    name: 'assistant_coach',
    inherits: ['parent'],
    permissions: [
      { resource: 'team_management', action: 'assist' },
      { resource: 'match_management', action: 'assist' },
      { resource: 'player_assignments', action: 'manage' },
      { resource: 'training_sessions', action: 'manage' },
    ]
  },
  
  coach: {
    name: 'coach',
    inherits: ['assistant_coach'],
    permissions: [
      { resource: 'team', action: 'manage' },
      { resource: 'players', action: 'manage' },
      { resource: 'matches', action: 'manage' },
      { resource: 'team_funds', action: 'manage' },
      { resource: 'invitations', action: 'send' },
      { resource: 'statistics', action: 'configure' },
    ]
  },
  
  referee: {
    name: 'referee',
    inherits: ['fan'],
    permissions: [
      { resource: 'match_officiating', action: 'manage' },
      { resource: 'availability', action: 'manage' },
      { resource: 'fees', action: 'set' },
    ]
  },
  
  // Club level roles (for future implementation)
  club_admin: {
    name: 'club_admin',
    inherits: ['coach'],
    permissions: [
      { resource: 'club', action: 'manage' },
      { resource: 'multiple_teams', action: 'manage' },
      { resource: 'club_finances', action: 'manage' },
    ]
  }
};

/**
 * Unified Permission System Class
 */
export class UnifiedPermissionSystem {
  private userContext: UserContext;
  
  constructor(userContext: UserContext) {
    this.userContext = userContext;
  }
  
  /**
   * Check if user has specific permission
   */
  hasPermission(resource: string, action: string, context?: Record<string, any>): boolean {
    const allPermissions = this.getAllPermissions();
    
    return allPermissions.some(permission => {
      if (permission.resource !== resource || permission.action !== action) {
        return false;
      }
      
      // Check conditions if they exist
      if (permission.conditions && context) {
        return this.checkConditions(permission.conditions, context);
      }
      
      return true;
    });
  }
  
  /**
   * Get all permissions for user (including inherited)
   */
  getAllPermissions(): Permission[] {
    const allPermissions: Permission[] = [];
    const processedRoles = new Set<string>();
    
    // Process all user roles
    for (const roleName of this.userContext.roles) {
      this.collectRolePermissions(roleName, allPermissions, processedRoles);
    }
    
    return allPermissions;
  }
  
  /**
   * Recursively collect permissions from role and inherited roles
   */
  private collectRolePermissions(
    roleName: string, 
    allPermissions: Permission[], 
    processedRoles: Set<string>
  ): void {
    if (processedRoles.has(roleName) || !ROLES[roleName]) {
      return;
    }
    
    processedRoles.add(roleName);
    const role = ROLES[roleName];
    
    // Add role's own permissions
    allPermissions.push(...role.permissions);
    
    // Recursively add inherited permissions
    if (role.inherits) {
      for (const inheritedRole of role.inherits) {
        this.collectRolePermissions(inheritedRole, allPermissions, processedRoles);
      }
    }
  }
  
  /**
   * Check permission conditions
   */
  private checkConditions(conditions: Record<string, any>, context: Record<string, any>): boolean {
    return Object.keys(conditions).every(key => {
      const requiredValue = conditions[key];
      const actualValue = context[key];
      
      if (requiredValue === true) {
        return Boolean(actualValue);
      }
      
      return actualValue === requiredValue;
    });
  }
  
  /**
   * Check if user can access team
   */
  canAccessTeam(teamId: string): boolean {
    // Coaches and assistant coaches can access their teams
    if (this.hasRole('coach') || this.hasRole('assistant_coach')) {
      return this.userContext.teamIds?.includes(teamId) || false;
    }
    
    // Parents can access teams their children are on
    if (this.hasRole('parent')) {
      return this.userContext.teamIds?.includes(teamId) || false;
    }
    
    return false;
  }
  
  /**
   * Check if user has specific role
   */
  hasRole(roleName: string): boolean {
    return this.userContext.roles.includes(roleName);
  }
  
  /**
   * Get user's primary role (highest priority)
   */
  getPrimaryRole(): string {
    const roleHierarchy = ['coach', 'assistant_coach', 'parent', 'player', 'referee', 'fan'];
    
    for (const role of roleHierarchy) {
      if (this.userContext.roles.includes(role)) {
        return role;
      }
    }
    
    return 'fan'; // Default
  }
  
  /**
   * Check if user can manage team funds
   */
  canManageTeamFunds(): boolean {
    return this.hasRole('coach'); // Only coaches can manage team funds
  }
  
  /**
   * Check if user can pay subs for a specific child
   */
  canPaySubsForChild(childId: string): boolean {
    // Parents can pay for their own children
    // Coaches can pay from team funds but this needs specific logic
    return this.hasRole('parent') || this.hasRole('coach');
  }
}

/**
 * Create permission system instance for user
 */
export function createPermissionSystem(userContext: UserContext): UnifiedPermissionSystem {
  return new UnifiedPermissionSystem(userContext);
}

/**
 * Helper function to check permissions in API routes
 */
export function checkApiPermission(
  userContext: UserContext,
  resource: string,
  action: string,
  context?: Record<string, any>
): boolean {
  const permissionSystem = createPermissionSystem(userContext);
  return permissionSystem.hasPermission(resource, action, context);
}
