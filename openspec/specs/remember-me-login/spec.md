## ADDED Requirements

### Requirement: Login SHALL support remember-me selection
The system SHALL allow users to choose whether the current login uses a normal session or a 7-day remember-me session. The login request MUST accept a boolean `rememberMe` field, and when the field is omitted the system MUST treat the login as a normal session by default.

#### Scenario: User logs in without remember-me
- **WHEN** the user submits the login form without selecting the 7-day remember-me option
- **THEN** the system authenticates the user and issues an access token and a normal-session refresh token

#### Scenario: User logs in with remember-me
- **WHEN** the user submits the login form with the 7-day remember-me option selected
- **THEN** the system authenticates the user and issues an access token and a 7-day remember-me refresh token

#### Scenario: Legacy client omits remember-me field
- **WHEN** a login request does not include the `rememberMe` field
- **THEN** the system MUST process the request as a normal session login

### Requirement: Refresh token lifetime SHALL reflect session type
The system SHALL use the refresh token lifetime to represent the selected login session type. Access token lifetime MUST remain short-lived and independent from the remember-me setting.

#### Scenario: Normal session uses shorter refresh lifetime
- **WHEN** the user logs in with a normal session
- **THEN** the issued refresh token MUST use the configured normal-session lifetime

#### Scenario: Remember-me session uses 7-day refresh lifetime
- **WHEN** the user logs in with remember-me enabled
- **THEN** the issued refresh token MUST use the configured remember-me lifetime of 7 days

#### Scenario: Access token policy remains unchanged
- **WHEN** the user logs in with or without remember-me enabled
- **THEN** the issued access token MUST continue using the existing short-lived access-token policy

### Requirement: Refresh flow SHALL preserve remember-me behavior
The system SHALL preserve the original session type when refreshing tokens. A refreshed token pair MUST continue using the same remember-me policy as the refresh token that initiated the refresh request.

#### Scenario: Refresh preserves normal session
- **WHEN** the client refreshes tokens using a normal-session refresh token
- **THEN** the system MUST issue a new token pair that continues using the normal-session refresh-token lifetime

#### Scenario: Refresh preserves remember-me session
- **WHEN** the client refreshes tokens using a remember-me refresh token
- **THEN** the system MUST issue a new token pair that continues using the remember-me refresh-token lifetime

#### Scenario: Client cannot change session type during refresh
- **WHEN** the client calls the refresh-token endpoint
- **THEN** the system MUST derive the next session type from the submitted refresh token rather than from a new client-selected remember-me flag

### Requirement: Login UI SHALL expose remember-me option
The system SHALL expose a 7-day remember-me option in the login UI so users can explicitly choose the longer session type during sign-in.

#### Scenario: Login form displays remember-me control
- **WHEN** the sign-in page is rendered
- **THEN** the page MUST display a selectable 7-day remember-me control associated with the login submission

#### Scenario: Login form submits remember-me choice
- **WHEN** the user submits the sign-in form
- **THEN** the login request payload MUST include the selected remember-me value
