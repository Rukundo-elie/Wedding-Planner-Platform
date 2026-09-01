const prisma = require('../config/db');

// Get notification summary based on logged in user's role
const getNotificationSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let summary = {
      role,
      total: 0,
      unreadChatMessages: 0,
    };

    // Chat unread messages for all authenticated users
    const unreadChatCount = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
    summary.unreadChatMessages = unreadChatCount;

    if (role === 'ADMIN') {
      const [pendingVendors, pendingPayments, unreadContacts] = await Promise.all([
        prisma.vendor.count({
          where: { OR: [{ isApproved: false }, { status: 'PENDING' }] },
        }),
        prisma.payment.count({
          where: { status: 'PENDING' },
        }),
        prisma.contactMessage.count({
          where: { isRead: false },
        }),
      ]);

      summary.pendingVendors = pendingVendors;
      summary.pendingPayments = pendingPayments;
      summary.unreadContacts = unreadContacts;
      summary.total = unreadChatCount + pendingVendors + pendingPayments + unreadContacts;
    } else if (role === 'PLANNER') {
      const [assignedTasks, pendingBookings] = await Promise.all([
        prisma.task.count({
          where: { plannerId: userId, status: 'PENDING' },
        }),
        prisma.booking.count({
          where: { status: 'PENDING' },
        }),
      ]);

      summary.assignedTasks = assignedTasks;
      summary.pendingBookings = pendingBookings;
      summary.total = unreadChatCount + assignedTasks + pendingBookings;
    } else if (role === 'VENDOR') {
      const vendorProfile = await prisma.vendor.findUnique({
        where: { userId },
      });

      summary.isApproved = vendorProfile ? vendorProfile.isApproved : false;
      summary.vendorStatus = vendorProfile ? vendorProfile.status : 'NO_PROFILE';
      summary.total = unreadChatCount;
    } else {
      // CLIENT
      summary.total = unreadChatCount;
    }

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching notification summary:', error);
    res.status(500).json({ message: 'Error retrieving notifications' });
  }
};

// Mark chat messages from a partner as read
const markChatAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partnerId } = req.params;

    if (!partnerId) {
      return res.status(400).json({ message: 'Partner ID is required' });
    }

    await prisma.message.updateMany({
      where: {
        senderId: parseInt(partnerId),
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking chat as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};

// Mark contact inquiry as read (Admin only)
const markContactAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.contactMessage.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });

    res.status(200).json({ message: 'Contact message marked as read' });
  } catch (error) {
    console.error('Error marking contact message as read:', error);
    res.status(500).json({ message: 'Error marking contact message as read' });
  }
};

module.exports = {
  getNotificationSummary,
  markChatAsRead,
  markContactAsRead,
};
