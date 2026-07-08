const prisma = require('../config/db');

// Get all packages
const getAllPackages = async (req, res) => {
  try {
    const packages = await prisma.package.findMany();
    res.status(200).json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Error retrieving packages' });
  }
};

// Get single package
const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await prisma.package.findUnique({
      where: { id: parseInt(id) },
    });
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json(pkg);
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({ message: 'Error retrieving package' });
  }
};

// Create a new package (Admin only)
const createPackage = async (req, res) => {
  try {
    const { name, description, price, image } = req.body;
    if (!name || !description || price === undefined) {
      return res.status(400).json({ message: 'Name, description, and price are required.' });
    }

    const newPackage = await prisma.package.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
      },
    });

    res.status(201).json({ message: 'Package created successfully', package: newPackage });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ message: 'Error creating package' });
  }
};

// Update package (Admin only)
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image } = req.body;

    const existingPackage = await prisma.package.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const updatedPackage = await prisma.package.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : existingPackage.name,
        description: description !== undefined ? description : existingPackage.description,
        price: price !== undefined ? parseFloat(price) : existingPackage.price,
        image: image !== undefined ? image : existingPackage.image,
      },
    });

    res.status(200).json({ message: 'Package updated successfully', package: updatedPackage });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ message: 'Error updating package' });
  }
};

// Delete package (Admin only)
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPackage = await prisma.package.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    await prisma.package.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ message: 'Error deleting package' });
  }
};

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
};
