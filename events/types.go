package events

import "time"

// EventMetadata contains common metadata for all events
type EventMetadata struct {
	TraceID       string    `json:"traceId"`
	CorrelationID string    `json:"correlationId"`
	Timestamp     time.Time `json:"timestamp"`
	Source        string    `json:"source"`
	Version       string    `json:"version"`
}

// BaseEvent is the wrapper for all events
type BaseEvent struct {
	EventID   string        `json:"eventId"`
	EventType string        `json:"eventType"`
	Metadata  EventMetadata `json:"metadata"`
	Payload   interface{}   `json:"payload"`
}

// ============================================
// USER PAYLOADS
// ============================================

type UserCreatedPayload struct {
	UserID    string `json:"userId"`
	TenantID  string `json:"tenantId"`
	Email     string `json:"email,omitempty"`
	Phone     string `json:"phone,omitempty"`
	CreatedAt string `json:"createdAt"`
}

type UserUpdatedPayload struct {
	UserID    string         `json:"userId"`
	TenantID  string         `json:"tenantId"`
	Changes   []FieldChange  `json:"changes"`
	UpdatedAt string         `json:"updatedAt"`
}

type FieldChange struct {
	Field    string `json:"field"`
	OldValue string `json:"oldValue,omitempty"`
	NewValue string `json:"newValue,omitempty"`
}

type UserDeletedPayload struct {
	UserID    string `json:"userId"`
	TenantID  string `json:"tenantId"`
	DeletedBy string `json:"deletedBy,omitempty"`
	Reason    string `json:"reason,omitempty"`
	DeletedAt string `json:"deletedAt"`
}

// ============================================
// AUTH PAYLOADS
// ============================================

type LoginSuccessPayload struct {
	UserID    string `json:"userId"`
	TenantID  string `json:"tenantId"`
	SessionID string `json:"sessionId"`
	IP        string `json:"ip"`
	UserAgent string `json:"userAgent"`
	DeviceID  string `json:"deviceId,omitempty"`
	Method    string `json:"method"` // password, otp, oauth, saml, passwordless
	Provider  string `json:"provider,omitempty"`
}

type LoginFailedPayload struct {
	Identifier   string `json:"identifier"`
	TenantID     string `json:"tenantId"`
	IP           string `json:"ip"`
	UserAgent    string `json:"userAgent"`
	Reason       string `json:"reason"`
	AttemptCount int    `json:"attemptCount"`
}

type LogoutPayload struct {
	UserID    string `json:"userId"`
	TenantID  string `json:"tenantId"`
	SessionID string `json:"sessionId"`
	Reason    string `json:"reason,omitempty"`
}

type TokenRefreshedPayload struct {
	UserID       string `json:"userId"`
	TenantID     string `json:"tenantId"`
	SessionID    string `json:"sessionId"`
	FamilyID     string `json:"familyId"`
	OldTokenHash string `json:"oldTokenHash"`
	NewTokenHash string `json:"newTokenHash"`
}

// ============================================
// TENANT PAYLOADS
// ============================================

type TenantCreatedPayload struct {
	TenantID       string `json:"tenantId"`
	Name           string `json:"name"`
	Slug           string `json:"slug"`
	CreatedByID    string `json:"createdById"`
	ParentTenantID string `json:"parentTenantId,omitempty"`
	HierarchyLevel int    `json:"hierarchyLevel"`
}

type MembershipChangedPayload struct {
	TenantID  string `json:"tenantId"`
	UserID    string `json:"userId"`
	Action    string `json:"action"` // added, removed, updated
	RoleName  string `json:"roleName,omitempty"`
	ChangedBy string `json:"changedBy,omitempty"`
}

// ============================================
// SESSION PAYLOADS
// ============================================

type SessionCreatedPayload struct {
	SessionID string `json:"sessionId"`
	UserID    string `json:"userId"`
	TenantID  string `json:"tenantId"`
	IP        string `json:"ip"`
	UserAgent string `json:"userAgent"`
	ExpiresAt string `json:"expiresAt"`
}

type SessionRevokedPayload struct {
	SessionID string `json:"sessionId"`
	UserID    string `json:"userId"`
	TenantID  string `json:"tenantId"`
	Reason    string `json:"reason"`
	RevokedBy string `json:"revokedBy,omitempty"`
}

// ============================================
// SECURITY PAYLOADS
// ============================================

type ThreatDetectedPayload struct {
	Type     string                 `json:"type"`
	Severity string                 `json:"severity"` // LOW, MEDIUM, HIGH, CRITICAL
	IP       string                 `json:"ip,omitempty"`
	UserID   string                 `json:"userId,omitempty"`
	TenantID string                 `json:"tenantId,omitempty"`
	Details  map[string]interface{} `json:"details"`
}

type IPBlockedPayload struct {
	IP        string `json:"ip"`
	Reason    string `json:"reason"`
	Duration  int    `json:"duration,omitempty"` // seconds, 0 for permanent
	BlockedBy string `json:"blockedBy,omitempty"`
}

// ============================================
// AUTHORIZATION PAYLOADS
// ============================================

type PermissionGrantedPayload struct {
	UserID         string `json:"userId"`
	TenantID       string `json:"tenantId"`
	PermissionID   string `json:"permissionId"`
	PermissionName string `json:"permissionName"`
	GrantedBy      string `json:"grantedBy,omitempty"`
	Reason         string `json:"reason,omitempty"`
}

type UserRoleAssignedPayload struct {
	UserID     string `json:"userId"`
	TenantID   string `json:"tenantId"`
	RoleID     string `json:"roleId"`
	RoleName   string `json:"roleName"`
	AssignedBy string `json:"assignedBy,omitempty"`
	ValidFrom  string `json:"validFrom"`
	ValidUntil string `json:"validUntil"`
}

// ============================================
// PROVIDER PAYLOADS
// ============================================

type MessageSentPayload struct {
	MessageID   string `json:"messageId"`
	ProviderID  string `json:"providerId"`
	Channel     string `json:"channel"` // sms, email, voice, push, whatsapp
	Destination string `json:"destination"`
	TenantID    string `json:"tenantId"`
	Status      string `json:"status"` // sent, pending
}

type ProviderHealthChangedPayload struct {
	ProviderID     string `json:"providerId"`
	ProviderName   string `json:"providerName"`
	PreviousStatus string `json:"previousStatus"`
	CurrentStatus  string `json:"currentStatus"`
	Reason         string `json:"reason,omitempty"`
}
