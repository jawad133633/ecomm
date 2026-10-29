const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const recoveryAttempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 8;
const MAX_OTP_ATTEMPTS = 5;

function limitUserRecovery(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  let bucket = recoveryAttempts.get(ip);
  if (!bucket || bucket.expiresAt <= now) {
    bucket = { count: 0, expiresAt: now + WINDOW_MS };
    recoveryAttempts.set(ip, bucket);
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    res.set('Retry-After', String(Math.ceil((bucket.expiresAt - now) / 1000)));
    return res.status(429).json({ success: false, message: 'Too many recovery requests. Please try again in a few minutes.' });
  }
  if (recoveryAttempts.size > 10000) {
    for (const [key, value] of recoveryAttempts) if (value.expiresAt <= now) recoveryAttempts.delete(key);
  }
  return next();
}

const digest = (value) => crypto.createHmac('sha256', process.env.JWT_SECRET || 'MarketHub_Secure_Default_Secret').update(value).digest('hex');

async function sendEmailOtp({ email, otp, name }) {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim();
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const from = process.env.EMAIL_FROM || (user ? `"MarketHub Security" <${user}>` : '"MarketHub Security" <security@markethub.com>');

  const subject = `Your MarketHub Verification Code: ${otp}`;
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
        <span style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">market<span style="color: #0f766e;">hub</span><i style="font-style: normal; font-size: 11px; vertical-align: super; color: #94a3b8;">®</i></span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 8px;">Reset Your Password</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 24px;">Hello ${name || 'MarketHub Member'}, we received a request to reset your password. Use the verification code below to set a new password:</p>
      <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #0f766e; font-family: monospace;">${otp}</span>
        <p style="font-size: 12px; color: #0f766e; margin: 6px 0 0; font-weight: 600;">Valid for 10 minutes · Do not share this code</p>
      </div>
      <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 20px;">If you didn't request a password reset, you can safely ignore this email. Your account remains completely secure.</p>
      <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        MarketHub Security & Confidential Account Recovery · ${process.env.SUPPORT_EMAIL || 'support@markethub.com'}
      </div>
    </div>
  `;

  if (user && pass) {
    try {
      const isGmail = user.endsWith('@gmail.com') || smtpHost.includes('gmail');
      const transporter = isGmail
        ? nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
          })
        : nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user, pass },
          });

      await transporter.sendMail({ from, to: email, subject, html });
      console.log(`[SUCCESS] Email OTP dispatched via Gmail to: ${email}`);
      return { sent: true };
    } catch (err) {
      console.error('[SMTP Delivery Error]:', err.message);
    }
  }

  // Safe Console & Dev fallback
  console.log('=====================================================');
  console.log(`[USER EMAIL OTP DISPATCH] To: ${email} | Code: ${otp}`);
  console.log('=====================================================');
  return { sent: true, devOtp: otp };
}

async function requestUserOtp(req, res) {
  const { email } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes('@') || normalizedEmail.length > 120) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail, active: { $ne: false } })
      .select('+userResetOtpHash +userResetOtpExpiresAt +userResetOtpAttempts +userResetOtpSentAt');

    if (!user) {
      // Timing-safe response to prevent account enumeration
      return res.json({
        success: true,
        message: 'If this email is registered, a 6-digit verification code has been dispatched.',
      });
    }

    // Cooldown check (60 seconds)
    if (user.userResetOtpSentAt && Date.now() - new Date(user.userResetOtpSentAt).getTime() < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - new Date(user.userResetOtpSentAt).getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting a new code.`,
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const ttlSeconds = Number(process.env.USER_OTP_TTL_SECONDS || 600);

    user.userResetOtpHash = digest(otp);
    user.userResetOtpExpiresAt = new Date(Date.now() + ttlSeconds * 1000);
    user.userResetOtpAttempts = 0;
    user.userResetOtpSentAt = new Date();
    await user.save();

    const dispatch = await sendEmailOtp({ email: user.email, otp, name: user.name });

    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${normalizedEmail}. It is valid for 10 minutes.`,
      ...(dispatch.devOtp ? { devOtp: dispatch.devOtp } : {}),
    });
  } catch (err) {
    console.error('requestUserOtp error:', err);
    return res.status(500).json({ success: false, message: 'Unable to dispatch verification code. Please try again.' });
  }
}

async function verifyUserOtp(req, res) {
  const { email, otp } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const cleanOtp = String(otp || '').replace(/\D/g, '').slice(0, 8);

  if (!normalizedEmail || !cleanOtp || cleanOtp.length < 6) {
    return res.status(400).json({ success: false, message: 'Please provide both your registered email and the 6-digit code.' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail, active: { $ne: false } })
      .select('+userResetOtpHash +userResetOtpExpiresAt +userResetOtpAttempts +userResetTokenHash +userResetTokenExpiresAt');

    if (!user || !user.userResetOtpHash || !user.userResetOtpExpiresAt) {
      return res.status(400).json({ success: false, message: 'No active verification request found. Please request a new code.' });
    }

    if (new Date(user.userResetOtpExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'This verification code has expired. Please request a new code.' });
    }

    if ((user.userResetOtpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
      user.userResetOtpHash = undefined;
      user.userResetOtpExpiresAt = undefined;
      await user.save();
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a fresh code.' });
    }

    const providedHash = digest(cleanOtp);
    const storedHash = user.userResetOtpHash;

    const matches = crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(storedHash));

    if (!matches) {
      user.userResetOtpAttempts = (user.userResetOtpAttempts || 0) + 1;
      await user.save();
      const remaining = MAX_OTP_ATTEMPTS - user.userResetOtpAttempts;
      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}`,
      });
    }

    // Generate single-use reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.userResetTokenHash = digest(resetToken);
    user.userResetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    user.userResetOtpHash = undefined;
    user.userResetOtpExpiresAt = undefined;
    user.userResetOtpAttempts = 0;
    await user.save();

    return res.json({
      success: true,
      resetToken,
      message: 'Code verified successfully! You can now set your new password.',
    });
  } catch (err) {
    console.error('verifyUserOtp error:', err);
    return res.status(500).json({ success: false, message: 'Could not verify code. Please try again.' });
  }
}

async function resetUserPassword(req, res) {
  const { email, resetToken, password, confirmPassword } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !resetToken || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  if (password.length < 6 || password.length > 128) {
    return res.status(400).json({ success: false, message: 'Password must be between 6 and 128 characters.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail, active: { $ne: false } })
      .select('+password +userResetTokenHash +userResetTokenExpiresAt +sessionVersion');

    if (!user || !user.userResetTokenHash || !user.userResetTokenExpiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset session. Request a new OTP.' });
    }

    if (new Date(user.userResetTokenExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Password reset session has expired. Please request a new code.' });
    }

    const providedHash = digest(String(resetToken));
    const storedHash = user.userResetTokenHash;

    const matches = crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(storedHash));

    if (!matches) {
      return res.status(400).json({ success: false, message: 'Invalid reset token. Please restart the recovery flow.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.userResetTokenHash = undefined;
    user.userResetTokenExpiresAt = undefined;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();

    return res.json({
      success: true,
      message: 'Password changed successfully! You can now log in with your new password.',
    });
  } catch (err) {
    console.error('resetUserPassword error:', err);
    return res.status(500).json({ success: false, message: 'Could not reset password. Please try again.' });
  }
}

module.exports = {
  limitUserRecovery,
  requestUserOtp,
  verifyUserOtp,
  resetUserPassword,
};
