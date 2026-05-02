export interface EventMetadata {
    traceId: string;
    correlationId: string;
    timestamp: string;
    source: string;
    version: string;
}
export interface BaseEvent<T = unknown> {
    eventId: string;
    eventType: string;
    metadata: EventMetadata;
    payload: T;
}
export declare const USER_TOPICS: {
    readonly USER_CREATED: "user.created";
    readonly USER_UPDATED: "user.updated";
    readonly USER_DELETED: "user.deleted";
    readonly USER_SUSPENDED: "user.suspended";
    readonly USER_ACTIVATED: "user.activated";
};
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
export declare const AUTH_TOPICS: {
    readonly LOGIN_SUCCESS: "auth.login.success";
    readonly LOGIN_FAILED: "auth.login.failed";
    readonly LOGOUT: "auth.logout";
    readonly TOKEN_REFRESHED: "auth.token.refreshed";
    readonly TOKEN_REVOKED: "auth.token.revoked";
    readonly MFA_ENABLED: "auth.mfa.enabled";
    readonly MFA_DISABLED: "auth.mfa.disabled";
    readonly MFA_VERIFIED: "auth.mfa.verified";
    readonly PASSWORD_CHANGED: "auth.password.changed";
    readonly OTP_REQUESTED: "auth.otp.requested";
    readonly OTP_VERIFIED: "auth.otp.verified";
    readonly OTP_FAILED: "auth.otp.failed";
};
export interface LoginSuccessPayload {
    userId: string;
    tenantId: string;
    sessionId: string;
    ip: string;
    userAgent: string;
    deviceId?: string;
    method: 'password' | 'otp' | 'oauth' | 'saml' | 'passwordless';
    provider?: string;
}
export interface LoginFailedPayload {
    identifier: string;
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
export declare const TENANT_TOPICS: {
    readonly TENANT_CREATED: "tenant.created";
    readonly TENANT_UPDATED: "tenant.updated";
    readonly TENANT_SUSPENDED: "tenant.suspended";
    readonly TENANT_ACTIVATED: "tenant.activated";
    readonly MEMBERSHIP_ADDED: "tenant.membership.added";
    readonly MEMBERSHIP_REMOVED: "tenant.membership.removed";
    readonly MEMBERSHIP_UPDATED: "tenant.membership.updated";
    readonly POLICY_CHANGED: "tenant.policy.changed";
};
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
export declare const SESSION_TOPICS: {
    readonly SESSION_CREATED: "session.created";
    readonly SESSION_REVOKED: "session.revoked";
    readonly SESSION_EXPIRED: "session.expired";
    readonly SESSION_COMPROMISED: "session.compromised";
    readonly ALL_SESSIONS_REVOKED: "session.all.revoked";
};
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
export declare const SECURITY_TOPICS: {
    readonly THREAT_DETECTED: "security.threat.detected";
    readonly IP_BLOCKED: "security.ip.blocked";
    readonly IP_UNBLOCKED: "security.ip.unblocked";
    readonly DEVICE_SUSPICIOUS: "security.device.suspicious";
    readonly BOT_DETECTED: "security.bot.detected";
    readonly INCIDENT_CREATED: "security.incident.created";
    readonly INCIDENT_RESOLVED: "security.incident.resolved";
};
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
    duration?: number;
    blockedBy?: string;
}
export declare const AUTHORIZATION_TOPICS: {
    readonly ROLE_CREATED: "authorization.role.created";
    readonly ROLE_UPDATED: "authorization.role.updated";
    readonly ROLE_DELETED: "authorization.role.deleted";
    readonly PERMISSION_GRANTED: "authorization.permission.granted";
    readonly PERMISSION_REVOKED: "authorization.permission.revoked";
    readonly USER_ROLE_ASSIGNED: "authorization.user.role.assigned";
    readonly USER_ROLE_REMOVED: "authorization.user.role.removed";
    readonly POLICY_EVALUATED: "authorization.policy.evaluated";
};
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
export declare const AUDIT_CONSUMER_TOPICS: readonly ["user.*", "auth.*", "tenant.*", "session.*", "security.*", "authorization.*"];
export declare const PROVIDER_TOPICS: {
    readonly MESSAGE_SENT: "provider.message.sent";
    readonly MESSAGE_DELIVERED: "provider.message.delivered";
    readonly MESSAGE_FAILED: "provider.message.failed";
    readonly PROVIDER_HEALTH_CHANGED: "provider.health.changed";
    readonly PROVIDER_CIRCUIT_OPENED: "provider.circuit.opened";
    readonly PROVIDER_CIRCUIT_CLOSED: "provider.circuit.closed";
};
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
