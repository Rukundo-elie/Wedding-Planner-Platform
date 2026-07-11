const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

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
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'wedding_planner_secret_key_12345',
      { expiresIn: '1d' }
    );
    
    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token,
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
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'wedding_planner_secret_key_12345',
      { expiresIn: '1d' }
    );
    
    // Exclude password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  register,
  login,
};
