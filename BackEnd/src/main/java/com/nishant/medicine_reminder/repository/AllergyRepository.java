package com.nishant.medicine_reminder.repository;

import com.nishant.medicine_reminder.model.Allergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllergyRepository extends JpaRepository<Allergy, Long> {
    List<Allergy> findByUserUserId(Long userId);
}
