package rw.financial.walletmate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.financial.walletmate.model.Notification;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserId(Long userId);

    List<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead);
}
