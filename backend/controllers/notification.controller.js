import Notification from "../models/Notification.model.js";

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort("-createdAt");
  res.json({ success: true, notifications });
};

// @desc    Mark as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { is_read: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
  res.json({ success: true, notification });
};

// @desc    Mark all as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, is_read: false }, { is_read: true });
  res.json({ success: true, message: "All notifications marked as read" });
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
  res.json({ success: true, message: "Notification deleted" });
};
