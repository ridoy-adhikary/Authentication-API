const jwt = require('jsonwebtoken');
const User = require('../models/usersModels');
const { doHash, doHashValidation, hmacProcess } = require('../utils/hashing');
const transport = require('../middlewares/sendMail');
const bcrypt = require('bcryptjs');
const { 
  signupSchema, 
  signinSchema, 
  acceptCodeSchema, 
  changePasswordSchema, 
  verifyForgotPasswordCodeSchema 
} = require('../middlewares/validator');

// ================== GENERATE TOKEN ==================
const generateToken = (user) => {
  if (!process.env.TOKEN_SECRET) throw new Error("TOKEN_SECRET is missing");
  return jwt.sign(
    { userId: user._id, verified: user.verified },
    process.env.TOKEN_SECRET,
    { expiresIn: '1d' }
  );
};

// ================== SIGNUP ==================
exports.signup = async (req, res) => {
  try {
    // Validate input
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists!" });
    }

    const hashedPassword = await doHash(password, 12);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: "Account created!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================== SIGNIN ==================
exports.signin = async (req, res) => {
  try {
    // Validate input
    const { error } = signinSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    const token = generateToken(user);

    // Set token in cookie
    res.cookie("Authorization", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        verified: user.verified
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================== SIGNOUT ==================
exports.signout = async (req, res) => {
  res.clearCookie("Authorization");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ================== SEND VERIFICATION CODE ==================
exports.sendVerificationCode = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ success: false, message: "User already verified" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = hmacProcess(code, process.env.HMAC_VERIFICATION_CODE_SECRET);
    
    user.verificationCode = hashedCode;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email (currently logging for dev)
    console.log(`Verification code for ${user.email}: ${code}`);
    
    // TODO: Send actual email
    // const mailOptions = {
    //   from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
    //   to: user.email,
    //   subject: 'Verification Code',
    //   text: `Your verification code is: ${code}`
    // };
    // await transport.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================== VERIFY VERIFICATION CODE ==================
exports.verifyVerificationCode = async (req, res) => {
  try {
    // Validate input
    const { error } = acceptCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const userId = req.user.userId;
    const { providedCode } = req.body;

    const user = await User.findById(userId).select("+verificationCode +verificationCodeExpires");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ success: false, message: "User already verified" });
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      return res.status(400).json({ success: false, message: "No verification code found. Please request a new one." });
    }

    if (Date.now() > user.verificationCodeExpires) {
      return res.status(400).json({ success: false, message: "Verification code expired" });
    }

    const hashedProvidedCode = hmacProcess(providedCode, process.env.HMAC_VERIFICATION_CODE_SECRET);
    
    if (user.verificationCode !== hashedProvidedCode) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    user.verified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Account verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ================== CHANGE PASSWORD ==================
exports.changePassword = async (req, res) => {
  try {
    // Validate input
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect" });
    }

    const hashedNewPassword = await doHash(newPassword, 12);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ================== FORGOT PASSWORD: SEND CODE ==================
exports.sendForgotPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = hmacProcess(code, process.env.HMAC_VERIFICATION_CODE_SECRET);
    
    user.forgotPasswordCode = hashedCode;
    user.forgotPasswordCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Send email (currently logging for dev)
    console.log(`Forgot password code for ${email}: ${code}`);
    
    // TODO: Send actual email
    // const mailOptions = {
    //   from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
    //   to: email,
    //   subject: 'Password Reset Code',
    //   text: `Your password reset code is: ${code}`
    // };
    // await transport.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Forgot password code sent successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================== FORGOT PASSWORD: VERIFY CODE ==================
exports.verifyForgotPasswordCode = async (req, res) => {
  try {
    // Validate input
    const { error } = verifyForgotPasswordCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { email, code } = req.body;

    const user = await User.findOne({ email }).select("+forgotPasswordCode +forgotPasswordCodeExpires");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.forgotPasswordCode || !user.forgotPasswordCodeExpires) {
      return res.status(400).json({ success: false, message: "No reset code found. Please request a new one." });
    }

    if (Date.now() > user.forgotPasswordCodeExpires) {
      return res.status(400).json({ success: false, message: "Reset code expired" });
    }

    const hashedProvidedCode = hmacProcess(code, process.env.HMAC_VERIFICATION_CODE_SECRET);
    
    if (user.forgotPasswordCode !== hashedProvidedCode) {
      return res.status(400).json({ success: false, message: "Invalid reset code" });
    }

    res.status(200).json({ success: true, message: "Code verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ================== RESET PASSWORD ==================
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, code, and new password are required" 
      });
    }

    const user = await User.findOne({ email }).select("+forgotPasswordCode +forgotPasswordCodeExpires");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.forgotPasswordCode || !user.forgotPasswordCodeExpires) {
      return res.status(400).json({ success: false, message: "No reset code found. Please request a new one." });
    }

    if (Date.now() > user.forgotPasswordCodeExpires) {
      return res.status(400).json({ success: false, message: "Reset code expired" });
    }

    const hashedProvidedCode = hmacProcess(code, process.env.HMAC_VERIFICATION_CODE_SECRET);
    
    if (user.forgotPasswordCode !== hashedProvidedCode) {
      return res.status(400).json({ success: false, message: "Invalid reset code" });
    }

    const hashedNewPassword = await doHash(newPassword, 12);
    user.password = hashedNewPassword;
    user.forgotPasswordCode = undefined;
    user.forgotPasswordCodeExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};