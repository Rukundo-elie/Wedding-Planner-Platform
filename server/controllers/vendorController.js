const prisma = require('../config/db');

// Get all vendors (with optional filtering)
const getAllVendors = async (req, res) => {
  try {
    const { service, location } = req.query;
    
    const filter = {};
    if (service) filter.service = service;
    if (location) filter.location = { contains: location };

    const vendors = await prisma.vendor.findMany({
      where: filter,
      orderBy: { name: 'asc' },
    });

    res.status(200).json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Error retrieving vendors' });
  }
};

// Get single vendor
const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(id) },
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

// Create a vendor (Admin/Planner only)
const createVendor = async (req, res) => {
  try {
    const { name, service, phone, email, price, location } = req.body;
    
    if (!name || !service || price === undefined) {
      return res.status(400).json({ message: 'Name, service, and price are required.' });
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        service,
        phone,
        email,
        price: parseFloat(price),
        location,
      },
    });

    res.status(201).json({ message: 'Vendor created successfully', vendor });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: 'Error creating vendor' });
  }
};

// Update vendor details (Admin/Planner)
const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, service, phone, email, price, location } = req.body;

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
      },
    });

    res.status(200).json({ message: 'Vendor updated successfully', vendor: updatedVendor });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ message: 'Error updating vendor' });
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
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
};
