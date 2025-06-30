package com.nishant.medicine_reminder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
@SpringBootApplication()
public class MedicineReminderApplication {

	public static void main(String[] args) {
		SpringApplication.run(MedicineReminderApplication.class, args);
	}

}
