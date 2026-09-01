const prisma = require('../config/db');

// Standard vendor service categories
const VENDOR_CATEGORIES = [
  'Venue',
  'Caterer',
  'Decorator',
  'Photographer',
  'DJ',
  'Transport',
  'Makeup Artist',
  'Cake & Pastry',
  'Entertainment'
];

// Get all vendors (Public gets approved only; Admin/Planner can get all or filter by status)
const getAllVendors = async (req, res) => {
  try {
    const { service, location, search, status, all } = req.query;
    const userRole = req.user?.role;

    const filter = {};

    // Filter by approval status
    if (all === 'true' && (userRole === 'ADMIN' || userRole === 'PLANNER')) {
      if (status) filter.status = status.toUpperCase();
    } else {
      // By default for public directory, only return APPROVED vendors
      if (status && (userRole === 'ADMIN' || userRole === 'PLANNER')) {
        filter.status = status.toUpperCase();
      } else {
        filter.isApproved = true;
      }
    }

    // Category / Service Filter
    if (service && service !== 'All') {
      filter.service = { equals: service };
    }

    // Location Filter
    if (location) {
      filter.location = { contains: location };
    }

    // Search Keyword Filter
    if (search) {
      filter.OR = [
        { name: { contains: search } },
        { service: { contains: search } },
        { location: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where: filter,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Error retrieving vendors' });
  }
};

// Get categories with counts of approved vendors
const getVendorCategories = async (req, res) => {
  try {
    const approvedVendors = await prisma.vendor.findMany({
      where: { isApproved: true },
      select: { service: true },
    });

    const counts = {};
    VENDOR_CATEGORIES.forEach((cat) => {
      counts[cat] = 0;
    });

    approvedVendors.forEach((v) => {
      if (counts[v.service] !== undefined) {
        counts[v.service]++;
      } else {
        counts[v.service] = 1;
      }
    });

    const categories = Object.keys(counts).map((category) => ({
      name: category,
      count: counts[category],
    }));

    res.status(200).json({
      totalApproved: approvedVendors.length,
      categories,
    });
  } catch (error) {
    console.error('Error fetching vendor categories:', error);
    res.status(500).json({ message: 'Error retrieving vendor categories' });
  }
};

// Get single vendor
const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Error retrieving vendor' });
  }
};

// Get profile of the logged-in vendor
const getMyVendorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found. Please create one.' });
    }

    res.status(200).json(vendor);
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ message: 'Error retrieving vendor profile' });
  }
};

// Update profile of the logged-in vendor
const updateMyVendorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, service, phone, email, price, location, description, image } = req.body;

    let vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      // Create if it doesn't exist yet for this user
      vendor = await prisma.vendor.create({
        data: {
          userId,
          name: name || req.user.name,
          service: service || 'Venue',
          phone: phone || req.user.phone,
          email: email || req.user.email,
          price: price !== undefined ? parseFloat(price) : 0,
          location: location || '',
          description: description || '',
          image: image || null,
          isApproved: false,
          status: 'PENDING',
        },
      });

      return res.status(201).json({
        message: 'Vendor business profile created successfully. Awaiting administrator approval.',
        vendor,
      });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { userId },
      data: {
        name: name !== undefined ? name : vendor.name,
        service: service !== undefined ? service : vendor.service,
        phone: phone !== undefined ? phone : vendor.phone,
        email: email !== undefined ? email : vendor.email,
        price: price !== undefined ? parseFloat(price) : vendor.price,
        location: location !== undefined ? location : vendor.location,
        description: description !== undefined ? description : vendor.description,
        image: image !== undefined ? image : vendor.image,
      },
    });

    res.status(200).json({
      message: 'Business profile updated successfully.',
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({ message: 'Error updating business profile' });
  }
};

// Create a vendor (Admin/Planner direct creation - auto approved)
const createVendor = async (req, res) => {
  try {
    const { name, service, phone, email, price, location, description, image } = req.body;

    if (!name || !service || price === undefined) {
      return res.status(400).json({ message: 'Name, service category, and price are required.' });
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        service,
        phone,
        email,
        price: parseFloat(price),
        location: location || '',
        description: description || '',
        image: image || null,
        isApproved: true,
        status: 'APPROVED',
      },
    });

    res.status(201).json({ message: 'Vendor created and published successfully', vendor });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: 'Error creating vendor' });
  }
};

// Update vendor details (Admin/Planner)
const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, service, phone, email, price, location, description, image, isApproved, status } = req.body;

    const existingVendor = await prisma.vendor.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingVendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : existingVendor.name,
        service: service !== undefined ? service : existingVendor.service,
        phone: phone !== undefined ? phone : existingVendor.phone,
        email: email !== undefined ? email : existingVendor.email,
        price: price !== undefined ? parseFloat(price) : existingVendor.price,
        location: location !== undefined ? location : existingVendor.location,
        description: description !== undefined ? description : existingVendor.description,
        image: image !== undefined ? image : existingVendor.image,
        isApproved: isApproved !== undefined ? Boolean(isApproved) : existingVendor.isApproved,
        status: status !== undefined ? status : existingVendor.status,
      },
    });

    res.status(200).json({ message: 'Vendor updated successfully', vendor: updatedVendor });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ message: 'Error updating vendor' });
  }
};

// Approve a vendor registration (Admin/Planner only)
const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(id) },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updated = await prisma.vendor.update({
      where: { id: parseInt(id) },
      data: {
        isApproved: true,
        status: 'APPROVED',
      },
    });

    res.status(200).json({
      message: `Vendor "${updated.name}" has been approved and added to the ${updated.service} category directory.`,
      vendor: updated,
    });
  } catch (error) {
    console.error('Error approving vendor:', error);
    res.status(500).json({ message: 'Error approving vendor' });
  }
};

// Reject a vendor registration (Admin/Planner only)
const rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(id) },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updated = await prisma.vendor.update({
      where: { id: parseInt(id) },
      data: {
        isApproved: false,
        status: 'REJECTED',
      },
    });

    res.status(200).json({
      message: `Vendor "${updated.name}" has been rejected.`,
      vendor: updated,
    });
  } catch (error) {
    console.error('Error rejecting vendor:', error);
    res.status(500).json({ message: 'Error rejecting vendor' });
  }
};

// Delete vendor (Admin/Planner)
const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const existingVendor = await prisma.vendor.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingVendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await prisma.vendor.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ message: 'Error deleting vendor' });
  }
};

module.exports = {
  getAllVendors,
  getVendorCategories,
  getVendorById,
  getMyVendorProfile,
  updateMyVendorProfile,
  createVendor,
  updateVendor,
  approveVendor,
  rejectVendor,
  deleteVendor,
  VENDOR_CATEGORIES,
};
