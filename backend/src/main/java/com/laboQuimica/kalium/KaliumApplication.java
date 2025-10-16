package com.laboQuimica.kalium;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KaliumApplication {

	public static void main(String[] args) {
		SpringApplication.run(KaliumApplication.class, args);
	}

}
