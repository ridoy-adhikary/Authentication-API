# Authentication API

A secure and robust authentication API built with Node.js, Express.js, and MongoDB. This API provides user registration, login, email verification, password management, and secure token-based authentication.

## Features

- **User Registration & Login**
- **Email Verification System**
- **Password Reset/Forgot Password**
- **JWT Token Authentication**
- **Password Hashing with bcrypt**
- **CORS Support**
- **Email Integration with Nodemailer**
- **Input Validation with Joi**
- **Cookie-based Token Storage**
-  **HMAC-based Code Security**

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Email Service:** Nodemailer
- **Validation:** Joi
- **Security:** Helmet, CORS
- **Environment Management:** dotenv

## Project Structure

```
authentication-api/
├── controllers/
│   └── authController.js      # Authentication logic
├── middlewares/
│   ├── identification.js      # JWT verification middleware
│   ├── sendMail.js           # Email configuration
│   └── validator.js          # Joi validation schemas
├── models/
│   └── usersModels.js        # User database schema
├── routers/
│   └── authRouter.js         # API routes
├── utils/
│   └── hashing.js           # Password & code hashing utilities
├── .env                     # Environment variables
├── index.js                 # Main server file
├── package.json            # Dependencies
└── README.md               # This file
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Gmail account (for email services)

### Step 1: Clone the Repository

```bash
git clone https://github.com/ridoy-Adhikary/authentication-api.git
cd authentication-api
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/your-database-name
# or for MongoDB Atlas:
# MONGO_URI=your_production_mongodb_uri
# JWT Secret (use a strong, random string)
TOKEN_SECRET=your_super_secret_jwt_key_here

# HMAC Secret for verification codes
HMAC_VERIFICATION_CODE_SECRET=your_hmac_secret_key_here

# Email Configuration (Gmail)
NODE_CODE_SENDING_EMAIL_ADDRESS=your-email@gmail.com
NODE_CODE_SENDING_EMAIL_PASSWORD=your-app-specific-password
```

### Step 4: Start the Server

```bash
# Development mode
npm start

# Development mode with nodemon (if installed)
npm run dev
```

The server will start on `http://localhost:8000`

## API Documentation

### Base URL
```
http://localhost:8000/api/auth
```

### Authentication Headers

For protected routes, include one of the following:

**Option 1: Authorization Header**
```
Authorization: Bearer <your-jwt-token>
```

**Option 2: Cookie (automatic)**
```
Cookie: Authorization=<your-jwt-token>
```

### Endpoints

#### 1. User Registration
```http
POST /signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created!"
}
```

**Validation Rules:**
- Email: Valid format, 6-60 characters
- Password: Minimum 8 characters, at least one lowercase, one uppercase, and one digit

---

#### 2. User Login
```http
POST /signin
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "user@example.com",
    "verified": false
  }
}
```

---

#### 3. User Logout
```http
POST /signout
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### 4. Send Verification Code
```http
PATCH /send-verification-code
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

---

#### 5. Verify Account
```http
PATCH /verify-verification-code
```
*Requires Authentication*

**Request Body:**
```json
{
  "providedCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account verified successfully"
}
```

---

#### 6. Change Password
```http
PATCH /change-password
```
*Requires Authentication*

**Request Body:**
```json
{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

#### 7. Send Forgot Password Code
```http
PATCH /send-forgot-password-code
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Forgot password code sent successfully"
}
```

---

#### 8. Verify Forgot Password Code
```http
PATCH /verify-forgot-password-code
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code verified successfully"
}
```

---

#### 9. Reset Password
```http
PATCH /reset-password
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created (successful registration)
- `400` - Bad Request (validation errors, invalid data)
- `401` - Unauthorized (invalid token or credentials)
- `403` - Forbidden (no token provided)
- `404` - Not Found (user not found, route not found)
- `500` - Internal Server Error

## Security Features

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 12
- Minimum password requirements enforced
- Old password verification required for password changes

### Token Security
- JWT tokens with 24-hour expiration
- Tokens stored in HTTP-only cookies for web clients
- Bearer token support for API clients

### Code Security
- Verification codes are HMAC-hashed before storage
- Codes expire after 10 minutes
- Secure random 6-digit code generation

### General Security
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Rate limiting considerations (can be added)

## Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App-Specific Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in your `.env` file

### Email Templates

Currently, verification codes are logged to console for development. To enable email sending:

1. Uncomment email sending code in `authController.js`
2. Customize email templates as needed
3. Configure your preferred email service

## Development

### Package.json Scripts

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "npm run test"
  }
}
```

### Dependencies

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.0.0",
    "joi": "^17.9.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.0",
    "nodemailer": "^6.9.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## Testing

### Using Postman

1. Import the API endpoints
2. Set up environment variables for base URL and token
3. Test each endpoint with various scenarios

### Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=8000
MONGO_URI=your_production_mongodb_uri
TOKEN_SECRET=your_strong_production_jwt_secret
HMAC_VERIFICATION_CODE_SECRET=your_production_hmac_secret
NODE_CODE_SENDING_EMAIL_ADDRESS=your_production_email
NODE_CODE_SENDING_EMAIL_PASSWORD=your_production_email_password
```

### Deployment Platforms

- **Heroku**: Add environment variables to config vars
- **Vercel**: Configure environment variables in project settings
- **Railway**: Set environment variables in project dashboard
- **DigitalOcean App Platform**: Configure via app spec or dashboard

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email your-email@example.com or create an issue in the GitHub repository.

## Changelog

### Version 1.0.0
- Initial release
- User registration and authentication
- Email verification system
- Password reset functionality
- JWT token-based authentication
- Comprehensive input validation
- Security middleware implementation

---
Possible Issues & Solutions
1. Common Development Issues

Route Conflicts: Ensure all routes use the correct prefix (e.g., /api/auth).

Missing Middleware: Add express.json() and cookie-parser in server.js.

Async Errors: Wrap controllers in try/catch or use an error-handling middleware.

2. Authentication & Token Issues

Bearer Token Missing: Always send Authorization: Bearer <token> in headers.

Token Expiration: Set proper JWT expiration and refresh mechanism.

3. Email Service Issues

Enable Gmail 2FA and use App Password for SMTP.

Check spam folder if emails don't arrive.

4. MongoDB Issues

Ensure MONGO_URI is correct.

Create an index for email (unique) to prevent duplicates.

5. Forgot Password & Verification Code Issues

Implement rate limiting to avoid abuse.

Hash verification codes in DB for security.

6. Deployment Issues

Configure CORS for your frontend domain.

Use HTTPS in production for secure cookies.

Set environment variables on the server.

7. Security Recommendations

Use a strong TOKEN_SECRET.

Implement rate limiting for login routes.

Add CSRF protection for cookie-based sessions.

