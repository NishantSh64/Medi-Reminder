package com.nishant.medicine_reminder.repository;

import com.nishant.medicine_reminder.model.Medicine;
import com.nishant.medicine_reminder.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    @Query("SELECT m FROM Medicine m WHERE m.user = :user")
    List<Medicine> findByUser(@Param("user") User user);

    @Query("SELECT m FROM Medicine m WHERE m.user.userId = :userId")
    List<Medicine> findByUserId(@Param("userId") Long userId);
}
