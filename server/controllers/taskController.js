const prisma = require('../config/db');

// Get tasks for a booking
const getTasksByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    // Verify booking access
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (role !== 'ADMIN' && role !== 'PLANNER' && booking.userId !== userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const tasks = await prisma.task.findMany({
      where: { bookingId: parseInt(bookingId) },
      include: {
        planner: { select: { id: true, name: true } },
      },
      orderBy: { id: 'asc' },
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error retrieving tasks' });
  }
};

// Create a custom task for a booking
const createTask = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { task, deadline } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (role !== 'ADMIN' && role !== 'PLANNER' && booking.userId !== userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (!task) {
      return res.status(400).json({ message: 'Task description is required.' });
    }

    const newTask = await prisma.task.create({
      data: {
        bookingId: parseInt(bookingId),
        task,
        deadline: deadline ? new Date(deadline) : null,
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

// Update task status / details
const updateTask = async (req, res) => {
  try {
    const { id } = req.params; // task ID
    const { status, plannerId, task: taskText, deadline } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { booking: true },
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Access control
    if (role !== 'ADMIN' && role !== 'PLANNER' && existingTask.booking.userId !== userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (plannerId !== undefined) updateData.plannerId = plannerId ? parseInt(plannerId) : null;
    if (taskText) updateData.task = taskText;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        planner: { select: { id: true, name: true } },
      },
    });

    res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

module.exports = {
  getTasksByBooking,
  createTask,
  updateTask,
};
