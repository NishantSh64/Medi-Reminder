package com.nishant.medicine_reminder.repository;

import com.nishant.medicine_reminder.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


@Repository  // ✅ Explicitly marking as a Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    @Query("SELECT r FROM Reminder r WHERE r.medicine.medicineId = :medicineId")
    List<Reminder> findByMedicineId(@Param("medicineId") Long medicineId);

}
