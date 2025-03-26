package com.nishant.medicine_reminder.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import com.nishant.medicine_reminder.model.User;
import com.nishant.medicine_reminder.model.Medicine;
@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    // Correct Query
    @Query("SELECT m FROM Medicine m WHERE m.user = :user")
    List<Medicine> findByUser(@Param("user") User user);


    // OR (if you want to use userId)
    @Query("SELECT m FROM Medicine m WHERE m.user.userId = :userId")
    List<Medicine> findByUserId(@Param("userId") Long userId);

}
