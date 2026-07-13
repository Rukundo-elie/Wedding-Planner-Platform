const prisma = require('./db');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    // Clear packages and vendors to force updates to reflect in database
    console.log('Refreshing packages and vendors in database...');
    await prisma.package.deleteMany();
    await prisma.vendor.deleteMany();

    // 1. Seed Packages
    await prisma.package.createMany({
      data: [
          {
            name: 'Silver Package',
            description: 'Essential wedding planning package. Includes venue decoration, professional photography (up to 6 hours), sound system with DJ, and a 2-tier wedding cake. Perfect for small, intimate gatherings.',
            price: 1500000.0,
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
          },
          {
            name: 'Gold Package',
            description: 'Comprehensive planning package. Includes everything in Silver, plus full-service catering for up to 100 guests, transport cars for the couple, 3-tier wedding cake, and professional makeup and hair for the bride.',
            price: 3500000.0,
            image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
          },
          {
            name: 'Diamond Package',
            description: 'Ultimate all-inclusive luxury wedding package. Includes premium floral decoration, professional photography and cinematic videography, catering for up to 250 guests, luxury wedding fleet (Mercedes/Range Rover), 5-tier cake, makeup, and live band performance.',
            price: 6000000.0,
            image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800',
          },
        ],
      });
      console.log('Packages seeded successfully.');

    // 2. Seed Vendors
    console.log('Seeding default vendors...');
    await prisma.vendor.createMany({
      data: [
          { name: 'Kigali Serena Hotel Venue', service: 'Venue', price: 1500000.0, location: 'Kigali City', phone: '+250788100100', email: 'serena.venue@hotel.rw' },
          { name: 'Akagera Hall Venue', service: 'Venue', price: 800000.0, location: 'Kigali City', phone: '+250788200200', email: 'akagera.hall@yahoo.com' },
          { name: 'Dream Events Decorators', service: 'Decorator', price: 600000.0, location: 'Kigali City', phone: '+250788300300', email: 'info@dreamevents.rw' },
          { name: 'Elegant Floral Art', service: 'Decorator', price: 400000.0, location: 'Rubavu', phone: '+250788400400', email: 'elegant.flowers@gmail.com' },
          { name: 'Delightful Bites Caterers', service: 'Caterer', price: 1200000.0, location: 'Kigali City', phone: '+250788500500', email: 'orders@delightfulbites.rw' },
          { name: 'Studio Rwanda Photography', service: 'Photographer', price: 500000.0, location: 'Kigali City', phone: '+250788600600', email: 'hello@studiorw.rw' },
          { name: 'Shyne Photography & Film', service: 'Photographer', price: 800000.0, location: 'Musanze', phone: '+250788700700', email: 'shyne.photo@gmail.com' },
          { name: 'DJ Focus & Sound System', service: 'DJ', price: 200000.0, location: 'Kigali City', phone: '+250788800800', email: 'djfocus@musichouse.rw' },
          { name: 'Kigali Luxury Ride Rentals', service: 'Transport', price: 300000.0, location: 'Kigali City', phone: '+250788900900', email: 'rentals@kigaliluxury.rw' },
          { name: 'Glamour Beauty Salon', service: 'Makeup Artist', price: 150000.0, location: 'Kigali City', phone: '+250788010010', email: 'glamour.salon@gmail.com' },
        ],
      });
      console.log('Vendors seeded successfully.');

    // 3. Seed an Admin and a Planner for testing
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount === 0) {
      console.log('Seeding default Admin user...');
      const adminPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          name: 'System Admin',
          email: 'admin@wedding.com',
          phone: '+250780000001',
          password: adminPassword,
          role: 'ADMIN',
        },
      });
    }

    const plannerCount = await prisma.user.count({ where: { role: 'PLANNER' } });
    if (plannerCount === 0) {
      console.log('Seeding default Planner user...');
      const plannerPassword = await bcrypt.hash('planner123', 10);
      await prisma.user.create({
        data: {
          name: 'Sarah Planner',
          email: 'planner@wedding.com',
          phone: '+250780000002',
          password: plannerPassword,
          role: 'PLANNER',
        },
      });
      console.log('Default users seeded: admin@wedding.com (admin123) and planner@wedding.com (planner123)');
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
