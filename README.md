# Saraha App — Backend API

A Node.js REST API for an anonymous messaging platform inspired by Saraha. Users can receive messages from others (with or without revealing their identity), manage profiles, and authenticate via email/password or Google OAuth.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Auth](#auth-routes-base-auth)
  - [Users](#users-routes-base-users)
  - [Messages](#messages-routes-base-messages)
- [Database Models](#database-models)
- [Security](#security)
- [File Uploads](#file-uploads)
- [Email & OTP](#email--otp)
- [Validation Rules](#validation-rules)
- [Error Handling](#error-handling)
- [Scripts](#scripts)

---

## Features

### Authentication & Authorization
- Email/password signup with email confirmation (OTP)
- Login with JWT access + refresh tokens
- Google OAuth signup and login
- Forgot password flow (OTP → verify → reset)
- Logout (single device or all devices)
- Role-based access (`user`, `admin`)
- Token revocation blacklist and credential invalidation

### User Management
- View and update profile (name, gender, phone)
- Change password with old-password history check
- Upload profile image and gallery (Cloudinary)
- Soft-delete (freeze) account
- Admin restore and hard-delete frozen accounts
- Public shared profile by user ID

### Messaging
- Send **anonymous** messages to any user (no auth required)
- Send **identified** messages when logged in (`senderId` attached)
- Text content and/or up to 2 image attachments per message

### Infrastructure
- MongoDB with Mongoose
- Joi request validation (body, params, headers, files)
- Helmet security headers
- Rate limiting (2000 requests / IP / hour)
- HTML email templates for OTP delivery
- AES encryption for phone numbers in the database

---

## Tech Stack

| Category        | Technology                          |
|-----------------|-------------------------------------|
| Runtime         | Node.js 24.16.0 (ES Modules)        |
| Framework       | Express 5                           |
| Database        | MongoDB + Mongoose 9                |
| Auth            | JWT, bcryptjs, Google Auth Library  |
| Validation      | Joi                                 |
| File Storage    | Cloudinary (+ local Multer fallback)|
| Email           | Nodemailer (Gmail)                  |
| Security        | Helmet, express-rate-limit, crypto-js |

---

## Project Structure

```
src/
├── index.js                    # Entry point (loads env, bootstraps app)
├── app.controller.js           # Express setup, middleware, route mounting
├── authorize/
│   └── authorize.js            # Role permissions map
├── db/
│   ├── connection.db.js        # MongoDB connection
│   ├── db.service.js           # Generic CRUD helpers
│   └── models/                 # User, Message, Token schemas
├── lib/
│   ├── constants/              # Enums, file filters, Joi shared fields
│   └── utils/
│       ├── emails/             # Send email + HTML templates
│       ├── events/             # Email event emitter
│       ├── multer/             # Local & Cloudinary upload middleware
│       └── security/           # JWT, hash, encryption helpers
├── middleware/
│   ├── authentication.middleware.js
│   └── validation.middleware.js
└── modules/
    ├── auth/                   # Signup, login, OTP, Google OAuth
    ├── users/                  # Profile, password, logout, uploads
    └── messages/               # Anonymous & authenticated messaging
```

---

## Getting Started

### Prerequisites

- Node.js **24.16.0**
- MongoDB instance (local or Atlas)
- Gmail account with app password (for OTP emails)
- Cloudinary account (for image uploads)
- Google OAuth Client ID (for Google login)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mo7med3li/saraha-app.git
cd saraha-app

# Install dependencies
npm install

# Create environment file
# Copy the variables listed below into src/config/.env

# Start development server
npm run dev
```

Server runs at `http://localhost:3000` (or the port set in `PORT`).

---

## Environment Variables

Create `src/config/.env`:

```env
# App
MODE=Dev
PORT=3000
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Database
DB_URI=mongodb+srv://<user>:<password>@<cluster>/<dbname>

# JWT — Users
USER_JWT_SECRET=your_user_access_secret
USER_REFRESH_JWT_SECRET=your_user_refresh_secret
ACCESS_TOKEN_EXPIRATION_TIME=1800
REFRESH_TOKEN_EXPIRATION_TIME=31536000

# JWT — Admins (System-level signatures)
SYSTEM_JWT_SECRET=your_admin_access_secret
SYSTEM_REFRESH_JWT_SECRET=your_admin_refresh_secret

# Security
SALT_ROUNDS=12
AES_SECRET_KEY=your_aes_secret_key

# Email (Gmail)
APP_EMAIL=your@gmail.com
APP_PASSWORD=your_gmail_app_password

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
APPLICATION_NAME=saraha-app
```

> **Note:** `ACCESS_TOKEN_EXPIRATION_TIME` and `REFRESH_TOKEN_EXPIRATION_TIME` are in **seconds** and must be numeric values (not strings like `"30m"`).

---

## Authentication

### Token Format

All protected routes require an `Authorization` header:

```
Authorization: Bearer <accessToken>    # regular users
Authorization: System <accessToken>    # admin users
```

Refresh token endpoint uses:

```
Authorization: Bearer <refreshToken>
```

### Token Lifecycle

| Action | Behavior |
|--------|----------|
| Login / Signup | Returns `{ accessToken, refreshToken }` pair sharing the same `jti` |
| Access token expires | Call `GET /users/refresh-token` with refresh token |
| Logout (current device) | Revokes token `jti` in blacklist |
| Logout (all devices) | Sets `changeCredentialsTime` — invalidates all prior tokens |
| Password change | Optional logout via `flag` (see [Logout Flags](#logout-flags)) |

### Logout Flags

Used in `POST /users/logout` and `PATCH /users/update-password`:

| Flag | Value | Effect |
|------|-------|--------|
| Current device | `signout` | Blacklist current token `jti` |
| All devices | `signoutFromAll` | Invalidate all tokens via `changeCredentialsTime` |
| Stay logged in | `stayLoggedIn` | No token invalidation (default on password change) |

### Roles

| Role | JWT prefix | Secret used |
|------|------------|-------------|
| `user` | `Bearer` | `USER_JWT_SECRET` |
| `admin` | `System` | `SYSTEM_JWT_SECRET` |

---

## API Reference

Base URL: `http://localhost:3000`

All successful responses follow:

```json
{
  "success": true,
  "message": "...",
  "data": { }
}
```

Errors return:

```json
{
  "success": false,
  "message": "...",
  "stack": "..."   // only when MODE=Dev
}
```

---

### Auth Routes (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | — | Register a new system user |
| PATCH | `/auth/confirm-email` | — | Confirm email with OTP |
| PATCH | `/auth/resend-confirm-email-otp` | — | Resend confirmation OTP |
| POST | `/auth/login` | — | Login with email & password |
| POST | `/auth/signup-google` | — | Google signup or login if account exists |
| POST | `/auth/login-google` | — | Google login (existing Google users only) |
| PATCH | `/auth/send-forgot-password-otp` | — | Send forgot-password OTP |
| PATCH | `/auth/verify-forgot-password-otp` | — | Verify forgot-password OTP |
| PATCH | `/auth/reset-password` | — | Reset password with OTP |

#### POST `/auth/signup`

```json
{
  "userName": "Ahmed Ali",
  "email": "ahmed@gmail.com",
  "password": "Ahmed@123",
  "confirmPassword": "Ahmed@123",
  "phoneNumber": "01012345678",
  "gender": "male"
}
```

Sends a 6-digit confirmation OTP to the email. User must confirm before login.

#### PATCH `/auth/confirm-email`

```json
{
  "email": "ahmed@gmail.com",
  "otp": "123456"
}
```

#### POST `/auth/login`

```json
{
  "email": "ahmed@gmail.com",
  "password": "Ahmed@123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### POST `/auth/signup-google` & `/auth/login-google`

```json
{
  "idToken": "<google_id_token>"
}
```

#### PATCH `/auth/reset-password`

```json
{
  "email": "ahmed@gmail.com",
  "otp": "123456",
  "newPassword": "NewPass@123",
  "confirmPassword": "NewPass@123"
}
```

---

### Users Routes (`/base/users`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/users/profile` | ✅ Access | user, admin | Get own profile + messages |
| GET | `/users/refresh-token` | ✅ Refresh | — | Issue new token pair |
| GET | `/users/:id` | — | — | Public shared user data |
| PATCH | `/users/` | ✅ Access | — | Update profile info |
| PATCH | `/users/update-password` | ✅ Access | — | Change password |
| POST | `/users/logout` | ✅ Access | — | Logout |
| DELETE | `/users/freeze-account` | ✅ Access | — | Freeze own account |
| DELETE | `/users/:id/freeze-account` | ✅ Access | admin | Admin freeze user account |
| PATCH | `/users/:id/restore-account` | ✅ Access | admin | Restore admin-frozen account |
| DELETE | `/users/:id` | ✅ Access | admin | Hard-delete frozen account |
| PATCH | `/users/profile-image` | ✅ Access | — | Upload profile image |
| PATCH | `/users/profile-gallery` | ✅ Access | — | Upload profile gallery |

#### PATCH `/users/` — Update profile

```json
{
  "userName": "Ahmed Ali",
  "gender": "male",
  "phoneNumber": "01012345678"
}
```

All fields are optional; send only what you want to update.

#### PATCH `/users/update-password`

```json
{
  "oldPassword": "Ahmed@123",
  "password": "NewPass@456",
  "confirmPassword": "NewPass@456",
  "flag": "signout"
}
```

`flag` options: `signout` | `signoutFromAll` | `stayLoggedIn` (default)

#### POST `/users/logout`

```json
{
  "flag": "signout"
}
```

`flag`: `signout` (default, current device) | `signoutFromAll` (all devices)

#### PATCH `/users/profile-image`

**Content-Type:** `multipart/form-data`

| Field | Type | Notes |
|-------|------|-------|
| `profileImage` | File | jpeg, png, jpg, webp — max 5 MB |

#### PATCH `/users/profile-gallery`

**Content-Type:** `multipart/form-data`

| Field | Type | Notes |
|-------|------|-------|
| `profileGallery` | File[] | Up to 5 images — replaces previous gallery |

---

### Messages Routes (`/messages`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/messages/:receiverId` | — | Send anonymous message |
| POST | `/messages/:receiverId/sender` | ✅ Access | Send message as logged-in user |

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `content` | Text | One of content or attachments | 3–20,000 characters |
| `attachments` | File[] | One of content or attachments | Up to 2 images (jpeg, png, jpg, webp) |

At least one of `content` or `attachments` must be provided.

**Anonymous example:**

```
POST /messages/64abc123def456789012345
Form-data:
  content: "You're awesome!"
  attachments: [image.png]
```

**Authenticated example:**

```
POST /messages/64abc123def456789012345/sender
Authorization: Bearer <accessToken>
Form-data:
  content: "Hello from a friend"
```

---

## Database Models

### User

| Field | Type | Description |
|-------|------|-------------|
| `firstName`, `lastName` | String | Stored separately; exposed as virtual `userName` |
| `email` | String | Unique |
| `password` | String | bcrypt hashed (system users only) |
| `oldPasswords` | [String] | Last 3 password hashes |
| `gender` | Enum | `male` \| `female` |
| `role` | Enum | `user` \| `admin` |
| `phoneNumber` | String | AES encrypted |
| `changeCredentialsTime` | Date | Invalidates tokens issued before this time |
| `confirmEmail` | Date | Set when email is confirmed |
| `confirmEmailOtp*` | — | OTP fields for email confirmation |
| `forgotPasswordOtp*` | — | OTP fields for password reset |
| `profileImage` | `{ imageUrl, asset_id }` | Cloudinary profile photo |
| `profileGallery` | `[{ imageUrl, asset_id }]` | Cloudinary gallery images |
| `providers` | Enum | `system` \| `google` |
| `deletedAt`, `deletedBy` | — | Soft delete (freeze) audit |
| `restoredAt`, `restoredBy` | — | Admin restore audit |

**Virtuals:** `userName`, `messages` (messages where user is sender)

### Message

| Field | Type | Description |
|-------|------|-------------|
| `content` | String | 3–20,000 chars; required if no attachments |
| `attachments` | `[{ imageUrl, asset_id }]` | Up to 2 Cloudinary images |
| `senderId` | ObjectId | Optional — null for anonymous messages |
| `receiverId` | ObjectId | Required |

**Virtuals:** `sender`, `receiver`

### Token (Revocation Blacklist)

| Field | Type | Description |
|-------|------|-------------|
| `jti` | String | JWT ID — unique |
| `expiresAt` | Number | Unix timestamp |
| `userId` | ObjectId | Owner of revoked token |

---

## Security

| Feature | Implementation |
|---------|----------------|
| Password hashing | bcrypt (`SALT_ROUNDS`) |
| Phone encryption | AES (`AES_SECRET_KEY`) |
| OTP storage | bcrypt hashed in DB |
| JWT secrets | Separate for users vs admins |
| Token blacklist | Revoked `jti` stored on logout |
| Credential rotation | `changeCredentialsTime` on password change / logout-all |
| Password history | Last 3 passwords cannot be reused |
| Rate limiting | 2000 req/IP/hour globally |
| OTP rate limiting | Max 5 sends → 5 min block; 2 min OTP TTL |
| Helmet | Security HTTP headers |
| Request validation | Joi on body, params, headers, files |
| Soft delete | Frozen accounts cannot login |

---

## File Uploads

### Cloudinary (active)

Used for profile images, gallery, and message attachments.

- **Middleware:** `cloudinaryFileUpload` — temp disk storage, 5 MB limit
- **Allowed types:** `image/jpeg`, `image/png`, `image/jpg`, `image/webp`
- **Folder structure:** `{APPLICATION_NAME}/users/{userId}/...` and `{APPLICATION_NAME}/messages/{receiverId}/attachments`

### Local Multer (available)

- Saves to `src/uploads/{customPath}/{userId}/`
- Served statically at `GET /uploads/*`
- Currently used only as infrastructure; active routes use Cloudinary

---

## Email & OTP

Emails are sent asynchronously via an event emitter (`email.event.js`) using Nodemailer + Gmail.

| Event | Trigger | Template |
|-------|---------|----------|
| `send-email` | Signup, resend confirmation | Confirm email (teal HTML template) |
| `send-email-forgot-password` | Forgot password OTP | Reset password (same template) |

### OTP Rules (confirmation & forgot password)

| Rule | Value |
|------|-------|
| OTP length | 6 digits |
| Validity | 2 minutes |
| Resend cooldown | Cannot resend while current OTP is still valid |
| Max attempts | 5 sends per window |
| Block duration | 5 minutes after 5 attempts |

---

## Validation Rules

| Field | Rule |
|-------|------|
| `userName` | `First Last` — 3–20 letters each, English or Arabic |
| `email` | Valid email; TLDs: com, net, org, edu, gov, io, co, eg, info, me, dev |
| `password` | 8–64 chars; upper + lower + number + special character |
| `phoneNumber` | Egyptian format: `01[0125]XXXXXXXX` (optional `+2` or `002` prefix) |
| `otp` | Exactly 6 digits |
| `gender` | `male` \| `female` |

---

## Error Handling

Global error handler returns HTTP status from `error.cause` when set, otherwise `500`.

Common status codes:

| Code | Meaning |
|------|---------|
| 400 | Validation error, bad request |
| 401 | Missing/invalid/expired token |
| 403 | Unauthorized role |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, password reuse, etc.) |
| 429 | Rate limit / OTP block |

---

## Scripts

```bash
npm run dev    # Start with nodemon (hot reload)
```

---

## Static Files

Locally uploaded files (if using local Multer) are served at:

```
GET /uploads/{path}
```

Cloudinary URLs are returned directly in API responses (`imageUrl` field).

---

## License

ISC
