package events

// Kafka Topics
const (
	// User Events
	TopicUserCreated   = "user.created"
	TopicUserUpdated   = "user.updated"
	TopicUserDeleted   = "user.deleted"
	TopicUserSuspended = "user.suspended"
	TopicUserActivated = "user.activated"

	// Auth Events
	TopicLoginSuccess    = "auth.login.success"
	TopicLoginFailed     = "auth.login.failed"
	TopicLogout          = "auth.logout"
	TopicTokenRefreshed  = "auth.token.refreshed"
	TopicTokenRevoked    = "auth.token.revoked"
	TopicMFAEnabled      = "auth.mfa.enabled"
	TopicMFADisabled     = "auth.mfa.disabled"
	TopicMFAVerified     = "auth.mfa.verified"
	TopicPasswordChanged = "auth.password.changed"
	TopicOTPRequested    = "auth.otp.requested"
	TopicOTPVerified     = "auth.otp.verified"
	TopicOTPFailed       = "auth.otp.failed"

	// Tenant Events
	TopicTenantCreated      = "tenant.created"
	TopicTenantUpdated      = "tenant.updated"
	TopicTenantSuspended    = "tenant.suspended"
	TopicTenantActivated    = "tenant.activated"
	TopicMembershipAdded    = "tenant.membership.added"
	TopicMembershipRemoved  = "tenant.membership.removed"
	TopicMembershipUpdated  = "tenant.membership.updated"
	TopicTenantPolicyChanged = "tenant.policy.changed"

	// Session Events
	TopicSessionCreated     = "session.created"
	TopicSessionRevoked     = "session.revoked"
	TopicSessionExpired     = "session.expired"
	TopicSessionCompromised = "session.compromised"
	TopicAllSessionsRevoked = "session.all.revoked"

	// Security Events
	TopicThreatDetected   = "security.threat.detected"
	TopicIPBlocked        = "security.ip.blocked"
	TopicIPUnblocked      = "security.ip.unblocked"
	TopicDeviceSuspicious = "security.device.suspicious"
	TopicBotDetected      = "security.bot.detected"
	TopicIncidentCreated  = "security.incident.created"
	TopicIncidentResolved = "security.incident.resolved"

	// Authorization Events
	TopicRoleCreated        = "authorization.role.created"
	TopicRoleUpdated        = "authorization.role.updated"
	TopicRoleDeleted        = "authorization.role.deleted"
	TopicPermissionGranted  = "authorization.permission.granted"
	TopicPermissionRevoked  = "authorization.permission.revoked"
	TopicUserRoleAssigned   = "authorization.user.role.assigned"
	TopicUserRoleRemoved    = "authorization.user.role.removed"
	TopicPolicyEvaluated    = "authorization.policy.evaluated"

	// Provider Events
	TopicMessageSent           = "provider.message.sent"
	TopicMessageDelivered      = "provider.message.delivered"
	TopicMessageFailed         = "provider.message.failed"
	TopicProviderHealthChanged = "provider.health.changed"
	TopicProviderCircuitOpened = "provider.circuit.opened"
	TopicProviderCircuitClosed = "provider.circuit.closed"
)

// AuditConsumerTopics - Topics that Audit Service subscribes to
var AuditConsumerTopics = []string{
	"user.*",
	"auth.*",
	"tenant.*",
	"session.*",
	"security.*",
	"authorization.*",
	"provider.*",
}
