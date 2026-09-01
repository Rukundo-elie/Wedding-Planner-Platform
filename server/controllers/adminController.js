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

module.exports = {
  getPlanners,
  createPlanner,
  deletePlanner,
};
