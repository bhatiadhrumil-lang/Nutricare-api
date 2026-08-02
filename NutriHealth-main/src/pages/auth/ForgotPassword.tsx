# FortiHealth - Forgot Password Page

## UI Structure
- Reuse branding from Login
- Use framer-motion animations
- Modal-style layout

## Components
- Email Input with auto-focus
- Continue button
- Back to Login button
- Error messages

## Storyboard
1. User clicks "Forgot Password?"
2. Shows email input field
3. On submit, disables button and input
4. Sends verification code via Cognito
5. Navigates to reset page with email in state

## Validation Rules
- Email required
- Valid format
- Disable button during loading
