const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const signup = async (req, res) => {
  const { name, email, password } = req.body || {};

  // Check required fields and types
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required.',
    });
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  // Validate name, email, and password
  if (!normalizedName || !normalizedEmail || password.length < 6) {
    return res.status(400).json({
      success: false,
      message:
        'Enter a name and email, and use a password with at least 6 characters.',
    });
  }

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
    });
  }

  try {
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. You can now log in.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    console.error('Signup failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to create your account. Please try again.',
    });
  }
};

const issueToken = (user, res) => {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }
  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role, sessionVersion: user.sessionVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
  return res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

const login = async (req, res, { adminOnly = false } = {}) => {
  try {
    const startTime = Date.now();
    const identifier = String(req.body?.email || req.body?.phone || req.body?.identifier || '').trim();
    const password = req.body?.password;

    if (!identifier || typeof password !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: adminOnly ? 'Administrator phone number or email and password are required.' : 'Email/phone and password are required.',
      });
    }

    let user = null;
    const isEmail = identifier.includes('@');

    if (isEmail) {
      const normalizedEmail = identifier.toLowerCase();
      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address.',
        });
      }

      user = await User.findOne({
        email: normalizedEmail,
      }).select('+password +sessionVersion');
    } else {
      // Identifier is a Phone Number
      const cleanDigits = identifier.replace(/\D/g, '');
      if (cleanDigits.length < 8 || cleanDigits.length > 15) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid phone number or email address.',
        });
      }

      const envAdminPhone = (process.env.ADMIN_PHONE_NUMBER || process.env.ADMIN_RECOVERY_WHATSAPP_NUMBER || '').replace(/\D/g, '');
      const isEnvAdminNumber = envAdminPhone && (
        cleanDigits === envAdminPhone ||
        (cleanDigits.length >= 10 && envAdminPhone.endsWith(cleanDigits.slice(-10))) ||
        (envAdminPhone.length >= 10 && cleanDigits.endsWith(envAdminPhone.slice(-10)))
      );

      if (isEnvAdminNumber) {
        user = await User.findOne({ role: 'admin', active: { $ne: false } }).select('+password +sessionVersion');
      }

      if (!user) {
        user = await User.findOne({
          $or: [
            { phone: identifier },
            { phone: cleanDigits },
            { phone: `+${cleanDigits}` },
          ],
        }).select('+password +sessionVersion');
      }
    }

    console.log(`Login DB query: ${Date.now() - startTime}ms`);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Check your email/phone number and password.',
      });
    }

    const bcryptStart = Date.now();
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Login bcrypt compare: ${Date.now() - bcryptStart}ms`);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Check your email/phone number and password.',
      });
    }

    if (adminOnly && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'This account does not have administrator access.' });
    }

    if (['admin', 'doctor', 'receptionist', 'pharmacist'].includes(user.role) && user.active === false) {
      return res.status(403).json({ success: false, message: 'This staff account is inactive. Contact a system administrator.' });
    }

    return issueToken(user, res);
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

module.exports = { signup, login, loginAdmin: (req, res) => login(req, res, { adminOnly: true }) };
