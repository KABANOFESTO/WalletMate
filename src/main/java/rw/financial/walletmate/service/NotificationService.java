package rw.financial.walletmate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rw.financial.walletmate.model.Notification;
import rw.financial.walletmate.repository.NotificationRepository;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Create a new notification
    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    // Get all notifications for a user
    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    // Get unread notifications for a user
    public List<Notification> getUnreadNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdAndIsRead(userId, false);
    }

    // Mark a notification as read
    public Notification markAsRead(Long id) {
        return notificationRepository.findById(id).map(notification -> {
            notification.setIsRead(true);
            return notificationRepository.save(notification);
        }).orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    // Delete a notification
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
