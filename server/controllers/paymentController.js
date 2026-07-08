const prisma = require('../config/db');

// Process a simulated payment
const processPayment = async (req, res) => {
  try {
    const { bookingId, amount, method } = req.body;
    const userId = req.user.id;

    if (!bookingId || !amount || !method) {
      return res.status(400).json({ message: 'Booking ID, amount, and payment method are required.' });
    }

    // Verify booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized to make payment for this booking.' });
    }

    // Simulate Transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: parseInt(bookingId),
        amount: parseFloat(amount),
        method,
        transactionId,
        status: 'PAID', // Simulated success
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED', // Set booking status to CONFIRMED when paid
      },
    });

    res.status(201).json({
      message: 'Payment completed successfully (Simulated)',
      payment,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
};

// Retrieve payments (Admin/Planner see all, Client sees only their own)
const getAllPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let payments;
    if (role === 'ADMIN' || role === 'PLANNER') {
      payments = await prisma.payment.findMany({
        include: {
          booking: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      payments = await prisma.payment.findMany({
        where: {
          booking: {
            userId: userId,
          },
        },
        include: {
          booking: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error retrieving payments' });
  }
};

module.exports = {
  processPayment,
  getAllPayments,
};
