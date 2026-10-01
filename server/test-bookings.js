const prisma = require('./config/db');

(async () => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: 7 },
      include: { package: true, tasks: true },
    });
    console.log('OK', bookings.length);
  } catch (error) {
    console.error('FAIL', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
