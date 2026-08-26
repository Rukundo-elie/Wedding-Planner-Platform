const prisma = require('../config/db');
const axios = require('axios');

// Process a manual payment
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

    // All manual payments are submitted as PENDING, awaiting admin verification
    const paymentStatus = 'PENDING';

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

    // Set booking payment status to PENDING (awaiting admin confirmation)
    await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        paymentStatus: 'PENDING',
      },
    });

    res.status(201).json({
      message: 'Payment details submitted successfully! Awaiting administrator verification.',
      payment,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
};

// Verify a Flutterwave payment
const verifyFlutterwavePayment = async (req, res) => {
  try {
    const { transactionId, bookingId } = req.body;
    const flwSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (!transactionId || !bookingId) {
      return res.status(400).json({ message: 'Transaction ID and Booking ID are required.' });
    }

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Developer bypass/sandbox simulation if secret key is missing:
    if (!flwSecretKey || flwSecretKey.includes('your_secret_key')) {
      console.warn('[Flutterwave Warning]: FLUTTERWAVE_SECRET_KEY is not configured in your .env. Simulating verified transaction.');
      
      const payment = await prisma.payment.create({
        data: {
          bookingId: parseInt(bookingId),
          amount: parseFloat(booking.budget),
          method: 'FLUTTERWAVE_MOMO',
          transactionId: `FLW-SIM-${Date.now()}`,
          status: 'PAID',
        },
      });

      await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        },
      });

      return res.status(201).json({
        message: 'Payment completed successfully (Sandbox Simulation Mode)',
        payment,
      });
    }

    // Call Flutterwave to verify the transaction
    const flwResponse = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${flwSecretKey}`,
        },
      }
    );

    const txData = flwResponse.data.data;

    // Verify transaction status
    if (flwResponse.data.status === 'success' && txData.status === 'successful') {
      // Check if transaction ID has already been verified to prevent duplicate records
      const existingPayment = await prisma.payment.findUnique({
        where: { transactionId: String(txData.id) },
      });

      if (existingPayment) {
        return res.status(400).json({ message: 'This transaction has already been verified.' });
      }

      // Create payment record in database
      const payment = await prisma.payment.create({
        data: {
          bookingId: parseInt(bookingId),
          amount: parseFloat(txData.amount),
          method: txData.payment_type ? txData.payment_type.toUpperCase() : 'FLUTTERWAVE',
          transactionId: String(txData.id),
          status: 'PAID',
        },
      });

      // Update associated booking
      await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        },
      });

      res.status(201).json({
        message: 'Online payment verified and completed successfully!',
        payment,
      });
    } else {
      res.status(400).json({ message: 'Transaction was not successful according to Flutterwave.' });
    }
  } catch (error) {
    console.error('Error verifying Flutterwave payment:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error verifying payment with gateway.' });
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
  verifyFlutterwavePayment,
  getAllPayments,
  verifyPayment,
  rejectPayment
};
