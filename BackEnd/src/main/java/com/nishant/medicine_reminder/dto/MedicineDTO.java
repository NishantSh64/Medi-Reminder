package com.nishant.medicine_reminder.dto;

public class MedicineDTO {
    private Long medicineId;
    private String dosage;
    // Getter and Setter
    public Long getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(Long medicineId) {
        this.medicineId = medicineId;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }
}
