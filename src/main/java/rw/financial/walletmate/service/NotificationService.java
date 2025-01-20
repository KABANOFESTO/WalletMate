package rw.financial.walletmate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rw.financial.walletmate.model.Notification;
import rw.financial.walletmate.model.User;
import rw.financial.walletmate.repository.NotificationRepository;

import java.util.Arrays;
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

    // Create default notifications for new user
    public void createDefaultNotifications(User user) {
        List<String> defaultMessages = Arrays.asList(
            "🎉 Welcome to WalletMate! Start managing your finances smarter.",
            "📊 Set up your first budget to track your spending",
            "💰 Add your first transaction to start tracking your expenses",
            "⚙️ Complete your profile settings to personalize your experience",
            "📑 Check out our categories section to organize your transactions"
        );

        defaultMessages.forEach(message -> {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setMessage(message);
            notification.setIsRead(false);
            createNotification(notification);
        });
    }
}
