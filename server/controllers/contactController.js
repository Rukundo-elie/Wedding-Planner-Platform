const prisma = require('../config/db');

// Create a new contact inquiry
const createContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        message
      }
    });

    res.status(201).json({ message: 'Thank you! Your message has been received. Our planners will contact you shortly.', contact });
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
};

// Retrieve all contact inquiries (Admin only)
const getAllContactMessages = async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ message: 'Error retrieving contact inquiries.' });
  }
};

module.exports = {
  createContactMessage,
  getAllContactMessages
};
