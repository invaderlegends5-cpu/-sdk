/**
 * Kafka Event Definitions
 * Shared event schemas for async communication between services
 */

// ============================================
// COMMON TYPES
// ============================================

export interface EventMetadata {
  traceId: string;
  correlationId: string;
  timestamp: string; // ISO 8601
  source: string;    // Service name
  version: string;   // Event schema version
}

export interface BaseEvent<T = unknown> {
  eventId: string;
  eventType: string;
  metadata: EventMetadata;
  payload: T;
}

// ============================================
// USER EVENTS (Topic: user.events)
// ============================================

export const USER_TOPICS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_SUSPENDED: 'user.suspended',
  USER_ACTIVATED: 'user.activated',
} as const;

export interface UserCreatedPayload {
  userId: string;
  tenantId: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface UserUpdatedPayload {
  userId: string;
  tenantId: string;
  changes: {
    field: string;
    oldValue?: string;
    newValue?: string;
  }[];
  updatedAt: string;
}

export interface UserDeletedPayload {
  userId: string;
  tenantId: string;
  deletedBy?: string;
  reason?: string;
  deletedAt: string;
}

// ============================================
// AUTH EVENTS (Topic: auth.events)
// ============================================

export const AUTH_TOPICS = {
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  LOGOUT: 'auth.logout',
  TOKEN_REFRESHED: 'auth.token.refreshed',
  TOKEN_REVOKED: 'auth.token.revoked',
  MFA_ENABLED: 'auth.mfa.enabled',
  MFA_DISABLED: 'auth.mfa.disabled',
  MFA_VERIFIED: 'auth.mfa.verified',
  PASSWORD_CHANGED: 'auth.password.changed',
  OTP_REQUESTED: 'auth.otp.requested',
  OTP_VERIFIED: 'auth.otp.verified',
  OTP_FAILED: 'auth.otp.failed',
} as const;

export interface LoginSuccessPayload {
  userId: string;
  tenantId: string;
  sessionId: string;
  ip: string;
  userAgent: string;
  deviceId?: string;
  method: 'password' | 'otp' | 'oauth' | 'saml' | 'passwordless';
  provider?: string; // For OAuth
}

export interface LoginFailedPayload {
  identifier: string; // phone or email
  tenantId: string;
  ip: string;
  userAgent: string;
  reason: string;
  attemptCount: number;
}

export interface LogoutPayload {
  userId: string;
  tenantId: string;
  sessionId: string;
  reason?: 'user_initiated' | 'session_expired' | 'forced' | 'security';
}

export interface TokenRefreshedPayload {
  userId: string;
  tenantId: string;
  sessionId: string;
  familyId: string;
  oldTokenHash: string;
  newTokenHash: string;
}

// ============================================
// TENANT EVENTS (Topic: tenant.events)
// ============================================

export const TENANT_TOPICS = {
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_SUSPENDED: 'tenant.suspended',
  TENANT_ACTIVATED: 'tenant.activated',
  MEMBERSHIP_ADDED: 'tenant.membership.added',
  MEMBERSHIP_REMOVED: 'tenant.membership.removed',
  MEMBERSHIP_UPDATED: 'tenant.membership.updated',
  POLICY_CHANGED: 'tenant.policy.changed',
} as const;

export interface TenantCreatedPayload {
  tenantId: string;
  name: string;
  slug: string;
  createdById: string;
  parentTenantId?: string;
  hierarchyLevel: number;
}

export interface MembershipChangedPayload {
  tenantId: string;
  userId: string;
  action: 'added' | 'removed' | 'updated';
  roleName?: string;
  changedBy?: string;
}

// ============================================
// SESSION EVENTS (Topic: session.events)
// ============================================

export const SESSION_TOPICS = {
  SESSION_CREATED: 'session.created',
  SESSION_REVOKED: 'session.revoked',
  SESSION_EXPIRED: 'session.expired',
  SESSION_COMPROMISED: 'session.compromised',
  ALL_SESSIONS_REVOKED: 'session.all.revoked',
} as const;

export interface SessionCreatedPayload {
  sessionId: string;
  userId: string;
  tenantId: string;
  ip: string;
  userAgent: string;
  expiresAt: string;
}

export interface SessionRevokedPayload {
  sessionId: string;
  userId: string;
  tenantId: string;
  reason: string;
  revokedBy?: string;
}

// ============================================
// SECURITY EVENTS (Topic: security.events)
// ============================================

export const SECURITY_TOPICS = {
  THREAT_DETECTED: 'security.threat.detected',
  IP_BLOCKED: 'security.ip.blocked',
  IP_UNBLOCKED: 'security.ip.unblocked',
  DEVICE_SUSPICIOUS: 'security.device.suspicious',
  BOT_DETECTED: 'security.bot.detected',
  INCIDENT_CREATED: 'security.incident.created',
  INCIDENT_RESOLVED: 'security.incident.resolved',
} as const;

export interface ThreatDetectedPayload {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ip?: string;
  userId?: string;
  tenantId?: string;
  details: Record<string, unknown>;
}

export interface IPBlockedPayload {
  ip: string;
  reason: string;
  duration?: number; // seconds, null for permanent
  blockedBy?: string;
}

// ============================================
// AUTHORIZATION EVENTS (Topic: authorization.events)
// ============================================

export const AUTHORIZATION_TOPICS = {
  ROLE_CREATED: 'authorization.role.created',
  ROLE_UPDATED: 'authorization.role.updated',
  ROLE_DELETED: 'authorization.role.deleted',
  PERMISSION_GRANTED: 'authorization.permission.granted',
  PERMISSION_REVOKED: 'authorization.permission.revoked',
  USER_ROLE_ASSIGNED: 'authorization.user.role.assigned',
  USER_ROLE_REMOVED: 'authorization.user.role.removed',
  POLICY_EVALUATED: 'authorization.policy.evaluated',
} as const;

export interface PermissionGrantedPayload {
  userId: string;
  tenantId: string;
  permissionId: string;
  permissionName: string;
  grantedBy?: string;
  reason?: string;
}

export interface UserRoleAssignedPayload {
  userId: string;
  tenantId: string;
  roleId: string;
  roleName: string;
  assignedBy?: string;
  validFrom: string;
  validUntil: string;
}

// ============================================
// AUDIT EVENTS (Topic: audit.events)
// Consumer only - Audit service subscribes to ALL topics
// ============================================

export const AUDIT_CONSUMER_TOPICS = [
  'user.*',
  'auth.*',
  'tenant.*',
  'session.*',
  'security.*',
  'authorization.*',
] as const;

// ============================================
// PROVIDER EVENTS (Topic: provider.events)
// ============================================

export const PROVIDER_TOPICS = {
  MESSAGE_SENT: 'provider.message.sent',
  MESSAGE_DELIVERED: 'provider.message.delivered',
  MESSAGE_FAILED: 'provider.message.failed',
  PROVIDER_HEALTH_CHANGED: 'provider.health.changed',
  PROVIDER_CIRCUIT_OPENED: 'provider.circuit.opened',
  PROVIDER_CIRCUIT_CLOSED: 'provider.circuit.closed',
} as const;

export interface MessageSentPayload {
  messageId: string;
  providerId: string;
  channel: 'sms' | 'email' | 'voice' | 'push' | 'whatsapp';
  destination: string;
  tenantId: string;
  status: 'sent' | 'pending';
}

export interface ProviderHealthChangedPayload {
  providerId: string;
  providerName: string;
  previousStatus: 'healthy' | 'degraded' | 'unhealthy';
  currentStatus: 'healthy' | 'degraded' | 'unhealthy';
  reason?: string;
}
