const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const attemptsByIp = new Map();
const windowMs = 15 * 60 * 1000;
const maxRequests = 10;
const maxOtpAttempts = 5;

function limitAdminRecovery(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  let bucket = attemptsByIp.get(ip);
  if (!bucket || bucket.expiresAt <= now) {
    bucket = { count: 0, expiresAt: now + windowMs };
    attemptsByIp.set(ip, bucket);
  }
  bucket.count += 1;
  if (bucket.count > maxRequests) {
    res.set('Retry-After', String(Math.ceil((bucket.expiresAt - now) / 1000)));
    return res.status(429).json({ success: false, message: 'Too many recovery attempts. Try again later.' });
  }
  if (attemptsByIp.size > 10000) {
    for (const [key, value] of attemptsByIp) if (value.expiresAt <= now) attemptsByIp.delete(key);
  }
  return next();
}

const digest = (value) => crypto.createHmac('sha256', process.env.JWT_SECRET || 'MarketHub_Secure_Default_Secret').update(value).digest('hex');

async function resolveAdminUser(identifier) {
  const raw = String(identifier || '').trim();
  if (!raw) return null;

  if (raw.includes('@')) {
    return User.findOne({ email: raw.toLowerCase(), role: 'admin', active: { $ne: false } })
      .select('+password +adminResetOtpHash +adminResetOtpExpiresAt +adminResetOtpAttempts +adminResetOtpSentAt +adminResetTokenHash +adminResetTokenExpiresAt');
  }

  const cleanDigits = raw.replace(/\D/g, '');
  const envPhone = (process.env.ADMIN_PHONE_NUMBER || process.env.ADMIN_RECOVERY_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const matchesEnv = envPhone && (
    cleanDigits === envPhone ||
    (cleanDigits.length >= 10 && envPhone.endsWith(cleanDigits.slice(-10))) ||
    (envPhone.length >= 10 && cleanDigits.endsWith(envPhone.slice(-10)))
  );

  if (matchesEnv) {
    const admin = await User.findOne({ role: 'admin', active: { $ne: false } })
      .select('+password +adminResetOtpHash +adminResetOtpExpiresAt +adminResetOtpAttempts +adminResetOtpSentAt +adminResetTokenHash +adminResetTokenExpiresAt');
    if (admin) return admin;
  }

  return User.findOne({
    role: 'admin',
    active: { $ne: false },
    $or: [{ phone: raw }, { phone: cleanDigits }, { phone: `+${cleanDigits}` }],
  }).select('+password +adminResetOtpHash +adminResetOtpExpiresAt +adminResetOtpAttempts +adminResetOtpSentAt +adminResetTokenHash +adminResetTokenExpiresAt');
}

async function changeAdminPassword(req, res) {
  const { currentPassword, password, confirmPassword } = req.body || {};
  if (typeof currentPassword !== 'string' || typeof password !== 'string' || password.length < 12 || password.length > 128 || password !== confirmPassword) {
    return res.status(400).json({ success: false, message: password !== confirmPassword ? 'Passwords do not match.' : 'Enter your current password and a new password between 12 and 128 characters.' });
  }
  try {
    const user = await User.findOne({ _id: req.user.id, role: 'admin', active: { $ne: false } }).select('+password');
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) return res.status(403).json({ success: false, message: 'Current password is incorrect.' });
    user.password = await bcrypt.hash(password, 12);
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();
    return res.json({ success: true, message: 'Password changed successfully. Sign in again with your new password.' });
  } catch (error) {
    console.error('Admin password change failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not change the password. Please try again.' });
  }
}

async function requestAdminOtp(req, res) {
  const identifier = String(req.body?.email || req.body?.phone || req.body?.identifier || '').trim();
  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Enter your administrator phone number or email address.' });
  }

  const rawRecoveryNumber = process.env.ADMIN_PHONE_NUMBER || process.env.ADMIN_RECOVERY_WHATSAPP_NUMBER || '+923340686111';
  const target = rawRecoveryNumber.replace(/\D/g, '');
  const maskedTarget = target.length >= 8 ? `+${target.slice(0, 4)}***${target.slice(-4)}` : rawRecoveryNumber;
  const genericMessage = `A WhatsApp recovery OTP has been dispatched to your confidential administrator number (${maskedTarget}).`;

  const configuredLength = Number.parseInt(process.env.ADMIN_OTP_LENGTH, 10);
  const otpLength = Number.isInteger(configuredLength) ? Math.min(8, Math.max(6, configuredLength)) : 6;
  const configuredTtl = Number.parseInt(process.env.ADMIN_OTP_TTL_SECONDS, 10);
  const ttlSeconds = Number.isInteger(configuredTtl) ? Math.min(900, Math.max(60, configuredTtl)) : 300;

  try {
    const user = await resolveAdminUser(identifier);
    if (!user) {
      return res.json({ success: true, message: genericMessage, targetPhone: maskedTarget });
    }

    const sentAt = new Date();
    if (user.adminResetOtpSentAt && sentAt.getTime() - new Date(user.adminResetOtpSentAt).getTime() < 30_000) {
      return res.status(429).json({ success: false, message: 'Please wait 30 seconds before requesting another WhatsApp code.' });
    }

    const otp = crypto.randomInt(0, 10 ** otpLength).toString().padStart(otpLength, '0');
    user.adminResetOtpHash = digest(`${user.email}:${otp}`);
    user.adminResetOtpExpiresAt = new Date(sentAt.getTime() + ttlSeconds * 1000);
    user.adminResetOtpAttempts = 0;
    user.adminResetOtpSentAt = sentAt;
    user.adminResetTokenHash = undefined;
    user.adminResetTokenExpiresAt = undefined;
    await user.save();

    console.log('\n======================================================');
    console.log('💬 [WHATSAPP OTP RECOVERY CODE]');
    console.log(`   To WhatsApp Number: +${target}`);
    console.log(`   Admin Account:      ${user.email}`);
    console.log(`   WhatsApp OTP:       ${otp}`);
    console.log(`   Expires in:         ${ttlSeconds} seconds`);
    console.log('======================================================\n');

    const { WA_ACCESS_TOKEN, WA_PHONE_NUMBER_ID, WA_ADMIN_OTP_TEMPLATE_NAME } = process.env;
    if (WA_ACCESS_TOKEN && WA_PHONE_NUMBER_ID && WA_ADMIN_OTP_TEMPLATE_NAME) {
      const version = process.env.WHATSAPP_GRAPH_API_VERSION || 'v23.0';
      try {
        await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(WA_PHONE_NUMBER_ID)}/messages`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${WA_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: target,
            type: 'template',
            template: {
              name: WA_ADMIN_OTP_TEMPLATE_NAME,
              language: { code: process.env.WA_ADMIN_OTP_TEMPLATE_LANGUAGE || 'en_US' },
              components: [
                { type: 'body', parameters: [{ type: 'text', text: otp }] },
                { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: otp }] },
              ],
            },
          }),
        });
      } catch (waErr) {
        console.warn('Meta WhatsApp API call notice:', waErr.message);
      }
    }

    return res.json({
      success: true,
      message: genericMessage,
      identifier: user.email,
      targetPhone: maskedTarget,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    console.error('Admin OTP request failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not send recovery OTP. Please try again.' });
  }
}

async function verifyAdminOtp(req, res) {
  const identifier = String(req.body?.email || req.body?.phone || req.body?.identifier || '').trim();
  const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';

  if (!identifier || !/^\d{6,8}$/.test(otp)) {
    return res.status(400).json({ success: false, message: 'Enter your phone number or email and the 6-digit WhatsApp recovery code.' });
  }

  try {
    const user = await resolveAdminUser(identifier);
    if (!user || !user.adminResetOtpHash || !user.adminResetOtpExpiresAt || user.adminResetOtpExpiresAt <= new Date()) {
      return res.status(400).json({ success: false, message: 'The recovery code is invalid or has expired. Please request a new code.' });
    }

    const submittedHash = Buffer.from(digest(`${user.email}:${otp}`), 'hex');
    const savedHash = Buffer.from(user.adminResetOtpHash, 'hex');
    const matches = submittedHash.length === savedHash.length && crypto.timingSafeEqual(submittedHash, savedHash);

    if (!matches) {
      user.adminResetOtpAttempts = (user.adminResetOtpAttempts || 0) + 1;
      if (user.adminResetOtpAttempts >= maxOtpAttempts) {
        user.adminResetOtpHash = undefined;
        user.adminResetOtpExpiresAt = undefined;
        user.adminResetOtpSentAt = undefined;
        user.adminResetOtpAttempts = 0;
        await user.save();
        return res.status(400).json({ success: false, message: 'Too many incorrect attempts. Request a new code.' });
      }
      await user.save();
      return res.status(400).json({ success: false, message: 'Incorrect recovery code. Check your WhatsApp.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.adminResetTokenHash = digest(`${user.email}:${resetToken}`);
    user.adminResetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    user.adminResetOtpHash = undefined;
    user.adminResetOtpExpiresAt = undefined;
    user.adminResetOtpSentAt = undefined;
    user.adminResetOtpAttempts = 0;
    await user.save();

    return res.json({
      success: true,
      resetToken,
      identifier: user.email,
      message: 'WhatsApp code verified. Set your new password to regain direct access.',
    });
  } catch (error) {
    console.error('Admin OTP verification failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not verify recovery code. Please try again.' });
  }
}

async function resetAdminPassword(req, res) {
  const identifier = String(req.body?.email || req.body?.phone || req.body?.identifier || '').trim();
  const resetToken = typeof req.body?.resetToken === 'string' ? req.body.resetToken : '';
  const password = req.body?.password;
  const confirmPassword = req.body?.confirmPassword;

  if (!identifier || !/^[a-f0-9]{64}$/i.test(resetToken)) {
    return res.status(400).json({ success: false, message: 'Verify your WhatsApp recovery code first before setting a new password.' });
  }

  if (typeof password !== 'string' || password.length < 12 || password.length > 128 || password !== confirmPassword) {
    return res.status(400).json({ success: false, message: password !== confirmPassword ? 'Passwords do not match.' : 'Use a password between 12 and 128 characters.' });
  }

  try {
    const user = await resolveAdminUser(identifier);
    if (!user || !user.adminResetTokenHash || !user.adminResetTokenExpiresAt || user.adminResetTokenExpiresAt <= new Date()) {
      return res.status(400).json({ success: false, message: 'Password reset authorization expired. Request and verify a new WhatsApp code.' });
    }

    const submittedHash = Buffer.from(digest(`${user.email}:${resetToken}`), 'hex');
    const savedHash = Buffer.from(user.adminResetTokenHash, 'hex');
    const matches = submittedHash.length === savedHash.length && crypto.timingSafeEqual(submittedHash, savedHash);

    if (!matches) {
      return res.status(400).json({ success: false, message: 'Invalid reset authorization. Request a new code.' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    user.adminResetTokenHash = undefined;
    user.adminResetTokenExpiresAt = undefined;
    await user.save();

    return res.json({
      success: true,
      message: 'Password changed successfully! You can now access the admin panel directly using your new password.',
    });
  } catch (error) {
    console.error('Admin password reset failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not reset the password. Please try again.' });
  }
}

module.exports = { requestAdminOtp, verifyAdminOtp, resetAdminPassword, changeAdminPassword, limitAdminRecovery };
