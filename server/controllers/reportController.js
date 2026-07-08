const prisma = require('../config/db');

const getAdminReports = async (req, res) => {
  try {
    // 1. Revenue Sum
    const paymentsSum = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'PAID',
      },
    });
    const totalRevenue = paymentsSum._sum.amount || 0;

    // 2. Bookings Counts
    const bookingsCount = await prisma.booking.count();
    
    // 3. Bookings by Status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // 4. User Counts by Role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    // 5. Package Popularity
    const packagesWithBookings = await prisma.package.findMany({
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });
    const packagePopularity = packagesWithBookings.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      bookingsCount: pkg._count.bookings,
    }));

    // 6. Recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        package: { select: { name: true } },
      },
    });

    res.status(200).json({
      totalRevenue,
      totalBookings: bookingsCount,
      bookingsByStatus,
      usersByRole,
      packagePopularity,
      recentBookings,
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ message: 'Error generating reports' });
  }
};

module.exports = {
  getAdminReports,
};
