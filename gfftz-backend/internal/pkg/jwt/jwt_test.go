package jwt

import (
	"testing"
	"time"

	"gfftz/internal/config"
)

func setTestJWTConfig() {
	config.GlobalConfig = &config.Config{
		JWT: config.JWTConfig{
			Secret:                     "test-secret",
			AccessExpiresIn:            "2h",
			RefreshExpiresIn:           "72h",
			RememberMeRefreshExpiresIn: "168h",
		},
	}
}

func requireExpirationInRange(t *testing.T, gotUnix int64, minTTL, maxTTL time.Duration) {
	t.Helper()

	gotTTL := time.Until(time.Unix(gotUnix, 0))
	if gotTTL < minTTL || gotTTL > maxTTL {
		t.Fatalf("unexpected token ttl: got=%s, want between %s and %s", gotTTL, minTTL, maxTTL)
	}
}

func TestGenTokenUsesNormalRefreshTTLByDefault(t *testing.T) {
	setTestJWTConfig()

	_, refreshToken, err := GenToken(1, false)
	if err != nil {
		t.Fatalf("GenToken returned error: %v", err)
	}

	claims, err := ParseToken(refreshToken)
	if err != nil {
		t.Fatalf("ParseToken returned error: %v", err)
	}

	if !claims.IsRefreshToken() {
		t.Fatalf("expected refresh token, got %q", claims.TokenType)
	}
	if claims.RememberMe {
		t.Fatalf("expected rememberMe=false on normal session refresh token")
	}

	requireExpirationInRange(t, claims.ExpiresAt, 71*time.Hour, 72*time.Hour+time.Minute)
}

func TestGenTokenUsesRememberMeRefreshTTL(t *testing.T) {
	setTestJWTConfig()

	_, refreshToken, err := GenToken(1, true)
	if err != nil {
		t.Fatalf("GenToken returned error: %v", err)
	}

	claims, err := ParseToken(refreshToken)
	if err != nil {
		t.Fatalf("ParseToken returned error: %v", err)
	}

	if !claims.IsRefreshToken() {
		t.Fatalf("expected refresh token, got %q", claims.TokenType)
	}
	if !claims.RememberMe {
		t.Fatalf("expected rememberMe=true on remember-me refresh token")
	}

	requireExpirationInRange(t, claims.ExpiresAt, 167*time.Hour, 168*time.Hour+time.Minute)
}

func TestRefreshFlowCanPreserveRememberMeFromClaims(t *testing.T) {
	setTestJWTConfig()

	_, refreshToken, err := GenToken(1, true)
	if err != nil {
		t.Fatalf("GenToken returned error: %v", err)
	}

	claims, err := ParseToken(refreshToken)
	if err != nil {
		t.Fatalf("ParseToken returned error: %v", err)
	}

	_, nextRefreshToken, err := GenToken(claims.UserID, claims.RememberMe)
	if err != nil {
		t.Fatalf("GenToken returned error when refreshing: %v", err)
	}

	nextClaims, err := ParseToken(nextRefreshToken)
	if err != nil {
		t.Fatalf("ParseToken returned error for refreshed token: %v", err)
	}

	if !nextClaims.RememberMe {
		t.Fatalf("expected refreshed token to preserve rememberMe=true")
	}
	requireExpirationInRange(t, nextClaims.ExpiresAt, 167*time.Hour, 168*time.Hour+time.Minute)
}
