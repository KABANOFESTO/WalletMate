package rw.financial.walletmate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.financial.walletmate.model.Report;
import rw.financial.walletmate.model.User;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    // Find reports by user and date range
    List<Report> findByUserAndStartDateBetween(User user, LocalDate startDate, LocalDate endDate);

    // Alternatively, if you want to keep using userId, you can use this:
    List<Report> findByUser_IdAndStartDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}