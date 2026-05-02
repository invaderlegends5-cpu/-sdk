"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDER_TOPICS = exports.AUDIT_CONSUMER_TOPICS = exports.AUTHORIZATION_TOPICS = exports.SECURITY_TOPICS = exports.SESSION_TOPICS = exports.TENANT_TOPICS = exports.AUTH_TOPICS = exports.USER_TOPICS = void 0;
exports.USER_TOPICS = {
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    USER_SUSPENDED: 'user.suspended',
    USER_ACTIVATED: 'user.activated',
};
exports.AUTH_TOPICS = {
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
};
exports.TENANT_TOPICS = {
    TENANT_CREATED: 'tenant.created',
    TENANT_UPDATED: 'tenant.updated',
    TENANT_SUSPENDED: 'tenant.suspended',
    TENANT_ACTIVATED: 'tenant.activated',
    MEMBERSHIP_ADDED: 'tenant.membership.added',
    MEMBERSHIP_REMOVED: 'tenant.membership.removed',
    MEMBERSHIP_UPDATED: 'tenant.membership.updated',
    POLICY_CHANGED: 'tenant.policy.changed',
};
exports.SESSION_TOPICS = {
    SESSION_CREATED: 'session.created',
    SESSION_REVOKED: 'session.revoked',
    SESSION_EXPIRED: 'session.expired',
    SESSION_COMPROMISED: 'session.compromised',
    ALL_SESSIONS_REVOKED: 'session.all.revoked',
};
exports.SECURITY_TOPICS = {
    THREAT_DETECTED: 'security.threat.detected',
    IP_BLOCKED: 'security.ip.blocked',
    IP_UNBLOCKED: 'security.ip.unblocked',
    DEVICE_SUSPICIOUS: 'security.device.suspicious',
    BOT_DETECTED: 'security.bot.detected',
    INCIDENT_CREATED: 'security.incident.created',
    INCIDENT_RESOLVED: 'security.incident.resolved',
};
exports.AUTHORIZATION_TOPICS = {
    ROLE_CREATED: 'authorization.role.created',
    ROLE_UPDATED: 'authorization.role.updated',
    ROLE_DELETED: 'authorization.role.deleted',
    PERMISSION_GRANTED: 'authorization.permission.granted',
    PERMISSION_REVOKED: 'authorization.permission.revoked',
    USER_ROLE_ASSIGNED: 'authorization.user.role.assigned',
    USER_ROLE_REMOVED: 'authorization.user.role.removed',
    POLICY_EVALUATED: 'authorization.policy.evaluated',
};
exports.AUDIT_CONSUMER_TOPICS = [
    'user.*',
    'auth.*',
    'tenant.*',
    'session.*',
    'security.*',
    'authorization.*',
];
exports.PROVIDER_TOPICS = {
    MESSAGE_SENT: 'provider.message.sent',
    MESSAGE_DELIVERED: 'provider.message.delivered',
    MESSAGE_FAILED: 'provider.message.failed',
    PROVIDER_HEALTH_CHANGED: 'provider.health.changed',
    PROVIDER_CIRCUIT_OPENED: 'provider.circuit.opened',
    PROVIDER_CIRCUIT_CLOSED: 'provider.circuit.closed',
};
//# sourceMappingURL=events.js.map