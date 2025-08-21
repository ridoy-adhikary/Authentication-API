const Joi = require('joi');

// ---------------- SIGNUP SCHEMA ----------------
exports.signupSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ['com', 'net', 'org', 'edu', 'gov'] } }),
    
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
      'string.pattern.base': 'Password must contain at least 8 characters with one lowercase, one uppercase, and one digit'
    })
});

// ---------------- SIGNIN SCHEMA ----------------
exports.signinSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ['com', 'net', 'org', 'edu', 'gov'] } }),
    
  password: Joi.string()
    .required()
    .min(8)
});

// ---------------- ACCEPT CODE SCHEMA ----------------
exports.acceptCodeSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .email({ tlds: { allow: ['com', 'net', 'org', 'edu', 'gov'] } })
    .optional(), // Make email optional for verification when using token
    
  providedCode: Joi.string()
    .length(6)              // exactly 6 characters
    .pattern(/^[0-9]+$/)    // only digits allowed
    .required()
});

// ---------------- CHANGE PASSWORD SCHEMA ----------------
exports.changePasswordSchema = Joi.object({
  newPassword: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
      'string.pattern.base': 'New password must contain at least 8 characters with one lowercase, one uppercase, and one digit'
    }),

  oldPassword: Joi.string()
    .required()
    .min(8)
});

// ---------------- VERIFY FORGOT PASSWORD CODE ----------------
exports.verifyForgotPasswordCodeSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ['com', 'net', 'org', 'edu', 'gov'] } }),

  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
});

// ---------------- RESET PASSWORD SCHEMA ----------------
exports.resetPasswordSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ['com', 'net', 'org', 'edu', 'gov'] } }),

  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),

  newPassword: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
      'string.pattern.base': 'New password must contain at least 8 characters with one lowercase, one uppercase, and one digit'
    })
});