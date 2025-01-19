package rw.financial.walletmate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rw.financial.walletmate.model.Notification;
import rw.financial.walletmate.service.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Create a new notification
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification createdNotification = notificationService.createNotification(notification);
        return ResponseEntity.ok(createdNotification);
    }

    // Get all notifications for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUser(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getNotificationsByUser(userId);
        return ResponseEntity.ok(notifications);
    }

    // Get unread notifications for a user
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotificationsByUser(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getUnreadNotificationsByUser(userId);
        return ResponseEntity.ok(notifications);
    }

    // Mark a notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification updatedNotification = notificationService.markAsRead(id);
        return ResponseEntity.ok(updatedNotification);
    }

    // Delete a notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
