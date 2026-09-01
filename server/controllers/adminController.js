const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all certified planners on the platform
const getPlanners = async (req, res) => {
  try {
    const planners = await prisma.user.findMany({
      where: { role: 'PLANNER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            plannerTasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(planners);
  } catch (error) {
    console.error('Error fetching planners:', error);
    res.status(500).json({ message: 'Error retrieving planners' });
  }
};

// Create a new Certified Planner (Admin only)
const createPlanner = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const planner = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone: phone || null,
        password: hashedPassword,
        role: 'PLANNER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: `Certified Planner "${planner.name}" provisioned successfully.`,
      planner,
    });
  } catch (error) {
    console.error('Error creating planner:', error);
    res.status(500).json({ message: 'Error provisioning planner account' });
  }
};

// Delete/Remove a Planner account (Admin only)
const deletePlanner = async (req, res) => {
  try {
    const { id } = req.params;

    const planner = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!planner || planner.role !== 'PLANNER') {
      return res.status(404).json({ message: 'Planner not found' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: `Planner "${planner.name}" removed successfully.` });
  } catch (error) {
    console.error('Error deleting planner:', error);
    res.status(500).json({ message: 'Error removing planner' });
  }
};

// Get platform bank account settings
const getBankSettings = async (req, res) => {
  try {
    let settings = await prisma.bankSetting.findFirst();
    if (!settings) {
      settings = await prisma.bankSetting.create({
        data: {
          bankName: 'Bank of Kigali (BK)',
          accountName: 'Wedding Planner Platform Ltd',
          accountNumber: '00095-07712345-88',
          instructions: 'Deposit directly at any branch or via internet banking. Take a photo or screenshot of the receipt slip and upload it above.',
        },
      });
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching bank settings:', error);
    res.status(500).json({ message: 'Error retrieving bank settings' });
  }
};

// Update platform bank account settings (Admin only)
const updateBankSettings = async (req, res) => {
  try {
    const { bankName, accountName, accountNumber, instructions } = req.body;

    if (!bankName || !accountName || !accountNumber) {
      return res.status(400).json({ message: 'Bank name, account name, and account number are required.' });
    }

    let settings = await prisma.bankSetting.findFirst();
    if (!settings) {
      settings = await prisma.bankSetting.create({
        data: {
          bankName,
          accountName,
          accountNumber,
          instructions: instructions || '',
        },
      });
    } else {
      settings = await prisma.bankSetting.update({
        where: { id: settings.id },
        data: {
          bankName,
          accountName,
          accountNumber,
          instructions: instructions !== undefined ? instructions : settings.instructions,
        },
      });
    }

    res.status(200).json({ message: 'Bank details updated successfully!', settings });
  } catch (error) {
    console.error('Error updating bank settings:', error);
    res.status(500).json({ message: 'Error updating bank settings' });
  }
};

module.exports = {
  getPlanners,
  createPlanner,
  deletePlanner,
  getBankSettings,
  updateBankSettings,
};
