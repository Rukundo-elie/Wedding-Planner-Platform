const prisma = require('../config/db');

// Send message
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required.' });
    }

    if (parseInt(receiverId) === senderId) {
      return res.status(400).json({ message: 'You cannot send a message to yourself.' });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) },
    });

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver user not found.' });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: parseInt(receiverId),
        content,
        isRead: false,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// Get messages between current user and another user
const getMessagesBetweenUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    const partnerId = parseInt(otherUserId);

    // Auto-mark incoming messages from this partner as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ message: 'Error retrieving messages' });
  }
};

// Get list of active chat partners with unread counts
const getChatPartners = async (req, res) => {
  try {
    const userId = req.user.id;

    // Retrieve all messages involving the current user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Extract unique partners and compute unread counts
    const partnerMap = new Map();
    messages.forEach((msg) => {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!partnerMap.has(partner.id)) {
        partnerMap.set(partner.id, {
          id: partner.id,
          name: partner.name,
          role: partner.role,
          lastMessage: msg.content,
          timestamp: msg.createdAt,
          unreadCount: 0,
        });
      }

      // Count unread message sent to the current user
      if (msg.senderId === partner.id && msg.receiverId === userId && !msg.isRead) {
        const item = partnerMap.get(partner.id);
        item.unreadCount = (item.unreadCount || 0) + 1;
      }
    });

    // Convert map values to array
    const partners = Array.from(partnerMap.values());
    res.status(200).json(partners);
  } catch (error) {
    console.error('Error fetching chat partners:', error);
    res.status(500).json({ message: 'Error retrieving chat contacts' });
  }
};

module.exports = {
  sendMessage,
  getMessagesBetweenUsers,
  getChatPartners,
};
