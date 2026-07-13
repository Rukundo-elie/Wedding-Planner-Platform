const prisma = require('../config/db');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { packageId, budget, date } = req.body;
    const userId = req.user.id; // From verifyToken middleware
    
    if (!budget || !date) {
      return res.status(400).json({ message: 'Budget and wedding date are required.' });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        packageId: packageId ? parseInt(packageId) : null,
        budget: parseFloat(budget),
        date: new Date(date),
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
    });

    // Auto-seed initial tasks for this wedding booking
    const initialTasks = [
      'Select and secure wedding venue',
      'Choose and finalize decoration theme',
      'Food catering menu selection and tasting',
      'Book photographer and videographer',
      'Arrange sound system, DJ, and playlist',
      'Arrange transport and wedding cars',
      'Coordinate bride and groom dressing/makeup',
      'Send guest invitations',
    ];

    await prisma.task.createMany({
      data: initialTasks.map(taskText => ({
        bookingId: booking.id,
        task: taskText,
        status: 'PENDING',
      })),
    });

    // Fetch the full booking with tasks
    const fullBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        tasks: true,
        package: true,
      },
    });

    res.status(201).json({ message: 'Booking created and tasks initialized!', booking: fullBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
};

// Get bookings (Admin/Planner see all, Client sees only their own)
const getAllBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let bookings;
    if (role === 'ADMIN' || role === 'PLANNER') {
      bookings = await prisma.booking.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          package: true,
          tasks: true,
        },
        orderBy: { date: 'asc' },
      });
    } else {
      bookings = await prisma.booking.findMany({
        where: { userId },
        include: {
          package: true,
          tasks: true,
        },
        orderBy: { date: 'asc' },
      });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error retrieving bookings' });
  }
};

// Get booking by id
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        package: true,
        tasks: {
          include: {
            planner: { select: { id: true, name: true } },
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization: Admin/Planner or owner client
    if (role !== 'ADMIN' && role !== 'PLANNER' && booking.userId !== userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ message: 'Error retrieving booking' });
  }
};

// Update booking status (Planner/Admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        status: status || booking.status,
        paymentStatus: paymentStatus || booking.paymentStatus,
      },
    });

    res.status(200).json({ message: 'Booking updated successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
};

// Update booking wedding cover photo
const updateBookingImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (role !== 'ADMIN' && role !== 'PLANNER' && booking.userId !== userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ message: 'Image data is required.' });
    }

    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format. Please upload a JPG, PNG, or WebP photo.' });
    }

    if (image.length > 10 * 1024 * 1024) {
      return res.status(400).json({ message: 'Image is too large. Please choose a smaller photo.' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { image },
    });

    res.status(200).json({ message: 'Wedding cover image updated successfully!', booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking image:', error);
    res.status(500).json({ message: 'Error updating wedding cover photo.' });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updateBookingImage,
};
