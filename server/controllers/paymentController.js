const prisma = require('../config/db');

// Process a payment
const processPayment = async (req, res) => {
  try {
    const { bookingId, amount, method, transactionId, slipImage } = req.body;
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

    // Auto-generate transaction ID if not provided (for instant online methods)
    const finalTransactionId = transactionId || `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Check if transactionId is unique
    const existingPayment = await prisma.payment.findUnique({
      where: { transactionId: finalTransactionId }
    });
    if (existingPayment) {
      return res.status(400).json({ message: 'Transaction ID already exists. Please use a unique one.' });
    }

    // Determine payment status based on method
    // Online instant payments are marked as PAID immediately.
    // Manual methods (Bank Transfer, Cash) require Admin verification and start as PENDING.
    const isInstant = ['CARD', 'MOMO', 'AIRTEL'].includes(method.toUpperCase());
    const paymentStatus = isInstant ? 'PAID' : 'PENDING';

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: parseInt(bookingId),
        amount: parseFloat(amount),
        method: method.toUpperCase(),
        transactionId: finalTransactionId,
        status: paymentStatus,
        slipImage: slipImage || null
      },
    });

    // Update booking payment and overall status if instant
    if (isInstant) {
      await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        },
      });
    } else {
      // If manual transfer, set booking payment status to pending approval
      await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: {
          paymentStatus: 'PENDING',
        },
      });
    }

    res.status(201).json({
      message: isInstant 
        ? 'Payment completed successfully!' 
        : 'Payment submitted successfully. Awaiting administrator verification.',
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
              package: true
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
          booking: {
            include: {
              package: true
            }
          },
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

// Verify a pending payment (Admin/Planner only)
const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role;

    if (role !== 'ADMIN' && role !== 'PLANNER') {
      return res.status(403).json({ message: 'Unauthorized to verify payments.' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }

    // Update payment record to PAID
    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: { status: 'PAID' },
    });

    // Update the associated booking
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED'
      }
    });

    res.status(200).json({
      message: 'Payment verified and booking confirmed successfully!',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

// Reject a pending payment (Admin/Planner only)
const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role;

    if (role !== 'ADMIN' && role !== 'PLANNER') {
      return res.status(403).json({ message: 'Unauthorized to reject payments.' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }

    // Update payment record to FAILED
    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: { status: 'FAILED' },
    });

    // Revert the associated booking payment status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: 'FAILED',
        status: 'PENDING'
      }
    });

    res.status(200).json({
      message: 'Payment has been rejected.',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ message: 'Error rejecting payment' });
  }
};

module.exports = {
  processPayment,
  getAllPayments,
  verifyPayment,
  rejectPayment
};
