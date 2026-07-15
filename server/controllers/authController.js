const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../config/db');

const googleClient = new OAuth2Client();

const createSession = (user) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'wedding_planner_secret_key_12345',
    { expiresIn: '1d' }
  );
  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Map role
    const userRole = role && ['CLIENT', 'PLANNER', 'VENDOR', 'ADMIN'].includes(role.toUpperCase())
      ? role.toUpperCase()
      : 'CLIENT';
      
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        role: userRole,
      },
    });
    
    const session = createSession(user);
    res.status(201).json({
      message: 'User registered successfully',
      ...session,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    // Compare password. Existing seeded/app-created users are bcrypt hashed.
    // If a user was inserted manually with plain text, allow one successful
    // login and immediately upgrade the stored password to a bcrypt hash.
    const passwordLooksHashed = /^\$2[aby]\$\d{2}\$/.test(user.password);
    const isPasswordCorrect = passwordLooksHashed
      ? await bcrypt.compare(password, user.password)
      : password === user.password;
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!passwordLooksHashed) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(password, 10) },
      });
    }
    
    const session = createSession(user);
    res.status(200).json({
      message: 'Login successful',
      ...session,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const normalizedEmail = req.body.email?.trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({ message: 'No Account For That Email' });
    }

    const response = { message: 'A reset link is ready for your account.' };

    if (user) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      const rawToken = crypto.randomBytes(32).toString('hex');
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: crypto.createHash('sha256').update(rawToken).digest('hex'),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      const appUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
      const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;
      // Connect your email provider here in production and send resetUrl to the user.
      if (process.env.NODE_ENV !== 'production') {
        response.resetUrl = resetUrl;
        response.token = rawToken;
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Unable to start password reset. Please try again.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 8) {
      return res.status(400).json({ message: 'Use a valid reset link and a password of at least 8 characters.' });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: crypto.createHash('sha256').update(token).digest('hex') },
      include: { user: true },
    });
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { password: await bcrypt.hash(password, 10) } }),
      prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
    ]);
    res.json({ message: 'Password updated. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Unable to reset password. Please try again.' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    // Developer bypass/simulation mode
    if (credential === 'demo-google-token') {
      let user = await prisma.user.findUnique({ where: { email: 'google.demo@gmail.com' } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: 'Demo Google User',
            email: 'google.demo@gmail.com',
            password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
            role: 'CLIENT',
          },
        });
      }
      return res.json({ message: 'Google sign-in successful (Demo)', ...createSession(user) });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ message: 'Google sign-in has not been configured yet.' });
    }
    if (!credential) return res.status(400).json({ message: 'Google credential is required.' });

    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const profile = ticket.getPayload();
    if (!profile?.email || !profile.email_verified) {
      return res.status(401).json({ message: 'Your Google email could not be verified.' });
    }

    const email = profile.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: profile.name || email.split('@')[0],
          email,
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
          role: 'CLIENT',
        },
      });
    }

    res.json({ message: 'Google sign-in successful', ...createSession(user) });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Google sign-in failed. Please try again.' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  googleLogin,
};
