package com.nishant.medicine_reminder.repository;

import com.nishant.medicine_reminder.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    @Query("SELECT r FROM Reminder r " +
                  "JOIN FETCH r.medicine m " +
                  "WHERE r.user.userId = :userId " +
                  "AND r.reminderDate = :reminderDate")
    List<Reminder> findByUserUserIdAndReminderDate(@Param("userId") Long userId,
                                                   @Param("reminderDate") LocalDate reminderDate);


    List<Reminder> findByUserUserIdAndReminderDateBetween(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT DISTINCT r.reminderDate FROM Reminder r WHERE r.user.userId = :userId AND r.reminderDate BETWEEN :start AND :end")
    List<LocalDate> findDistinctReminderDatesByUserUserIdAndReminderDateBetween(@Param("userId") Long userId,
                                                                                @Param("start") LocalDate start,
                                                                                @Param("end") LocalDate end);
    List<Reminder> findByUser_UserId(Long userId);
}
