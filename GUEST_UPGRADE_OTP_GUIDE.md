# Guest User Upgrade with OTP Verification

## Overview
The guest upgrade process now includes a two-step email verification flow with OTP (One-Time Password) to ensure secure account upgrades.

## How It Works

### Step 1: User Information Collection
1. User clicks on the "Guest" badge (header or bottom nav)
2. Modal opens showing "Step 1 of 2"
3. User fills in:
   - Full Name
   - Email Address
   - Gender
   - Password (min 8 characters)
   - Confirm Password
4. User clicks "Send OTP"

### Step 2: OTP Verification
1. System generates a 6-digit OTP
2. OTP is logged to the server console (since email is not configured yet)
3. In development mode, OTP is also displayed in the modal for testing
4. User enters the 6-digit OTP
5. User clicks "Verify & Upgrade"
6. Account is upgraded and user is automatically logged in

## Testing the Feature

### Prerequisites
- Have a guest account created (or create one)
- Server terminal/console should be visible to see the OTP

### Test Steps

1. **Start as Guest User**
   - Login as a guest or create a new guest account

2. **Open Upgrade Modal**
   - Click the orange "Guest" badge in header (desktop) or bottom navigation (mobile)

3. **Fill Step 1 Form**
   - Enter full name: `Test User`
   - Enter email: `test@example.com`
   - Select gender: `Male/Female/Other`
   - Enter password: `TestPass123` (min 8 chars)
   - Confirm password: `TestPass123`
   - Click "Send OTP"

4. **Check Server Console**
   - Look for the OTP code in your terminal/console
   - You'll see something like:
   ```
   ============================================================
   🔐 OTP VERIFICATION CODE
   ============================================================
   User ID: xxx-xxx-xxx-xxx
   Email: test@example.com
   OTP Code: 123456
   Expires in: 10 minutes
   ============================================================
   ```

5. **In Development Mode**
   - The OTP will also be shown in the modal as: `DEV MODE: Your OTP is 123456`
   - Toast notification will show: `OTP sent! Check console (Dev: 123456)`

6. **Enter OTP**
   - Type the 6-digit code in the verification field
   - The "Verify & Upgrade" button will be enabled when 6 digits are entered

7. **Complete Upgrade**
   - Click "Verify & Upgrade"
   - Account will be upgraded
   - User will be automatically logged in with new credentials
   - Page will refresh to show full member status

## API Endpoints

### 1. Send OTP
- **Endpoint**: `/api/auth/send-upgrade-otp`
- **Method**: POST
- **Body**:
  ```json
  {
    "fullName": "Test User",
    "email": "test@example.com",
    "gender": "male"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "devOTP": "123456" // Only in development
  }
  ```

### 2. Verify OTP & Upgrade
- **Endpoint**: `/api/auth/verify-upgrade-otp`
- **Method**: POST
- **Body**:
  ```json
  {
    "otp": "123456",
    "password": "TestPass123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": { /* updated user object */ },
    "message": "Account upgraded successfully"
  }
  ```

## Features

### Security
- ✅ 6-digit numeric OTP
- ✅ 10-minute expiration time
- ✅ OTP is single-use (deleted after verification)
- ✅ Server-side validation
- ✅ Email uniqueness check

### User Experience
- ✅ Two-step wizard interface
- ✅ Step indicator (Step 1 of 2, Step 2 of 2)
- ✅ Visual feedback for password matching
- ✅ Disabled state during loading
- ✅ "Resend OTP" option
- ✅ "Back" button to edit information
- ✅ Auto-focus on OTP input
- ✅ Large, centered OTP input field
- ✅ Development mode shows OTP in modal and toast

### Accessibility
- ✅ Keyboard navigation (Escape to close, Tab/Shift+Tab)
- ✅ Backdrop click to close
- ✅ Form validation with error messages
- ✅ Loading states with spinners
- ✅ Clear button labels and instructions

## OTP Storage

### Development (Current)
- In-memory Map storage via `lib/otpStore.ts`
- Shared singleton instance across API endpoints
- Automatic cleanup of expired OTPs every 5 minutes

### Production (Recommended)
Replace `lib/otpStore.ts` with:
- **Redis**: Fast, distributed storage
- **Database**: Persistent storage with TTL
- **Third-party service**: Twilio, SendGrid, etc.

## Email Configuration (Future)

When ready to send real emails, update `/pages/api/auth/send-upgrade-otp.ts`:

```typescript
// Replace console.log with actual email sending
import { sendEmail } from '../../../lib/email';

await sendEmail({
  to: email,
  subject: 'Verify Your Plas Account Upgrade',
  html: `
    <h1>Verify Your Account</h1>
    <p>Your verification code is: <strong>${otp}</strong></p>
    <p>This code will expire in 10 minutes.</p>
  `
});
```

## Troubleshooting

### OTP Not Working
1. Check server console for the OTP code
2. Ensure OTP is entered within 10 minutes
3. Verify you're entering exactly 6 digits
4. Try "Resend OTP" if expired

### Modal Not Closing
1. Check for network errors in browser console
2. Ensure API endpoints are accessible
3. Verify session is active

### Upgrade Fails
1. Check if email is already in use
2. Verify password meets requirements (min 8 chars)
3. Check server logs for detailed error messages

## Files Modified/Created

### Created
- ✅ `/pages/api/auth/send-upgrade-otp.ts` - Send OTP endpoint
- ✅ `/pages/api/auth/verify-upgrade-otp.ts` - Verify OTP endpoint
- ✅ `/lib/otpStore.ts` - Shared OTP storage
- ✅ `/GUEST_UPGRADE_OTP_GUIDE.md` - This guide

### Modified
- ✅ `/src/components/ui/GuestUpgradeModal.tsx` - Two-step upgrade flow

## Next Steps

1. ✅ Test the OTP flow thoroughly
2. ⏳ Configure email service (SendGrid, AWS SES, etc.)
3. ⏳ Replace in-memory OTP store with Redis/Database
4. ⏳ Add rate limiting to prevent OTP spam
5. ⏳ Add analytics/logging for upgrade flow
6. ⏳ Consider SMS OTP as alternative/backup

---

**Note**: Remove `devOTP` from API response when deploying to production!
