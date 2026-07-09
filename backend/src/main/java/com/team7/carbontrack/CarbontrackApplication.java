package com.team7.carbontrack;

import com.team7.carbontrack.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;

/**
 * CarbonTrack - Milestone 1
 * User Profiles, Activity Logging Schema & Emission Calculation Engine.
 */
@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
@EnableCaching
public class CarbontrackApplication {
 
    public static void main(String[] args) {
        loadEnv();
        SpringApplication.run(CarbontrackApplication.class, args);
    }

    private static void loadEnv() {
        java.io.File envFile = new java.io.File(".env");
        if (!envFile.exists()) {
            envFile = new java.io.File("../.env");
        }
        if (envFile.exists()) {
            try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(envFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();
                        // Strip surrounding quotes if present
                        if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                            value = value.substring(1, value.length() - 1);
                        } else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
                            value = value.substring(1, value.length() - 1);
                        }
                        System.setProperty(key, value);
                    }
                }
            } catch (java.io.IOException e) {
                System.err.println("Could not load .env file: " + e.getMessage());
            }
        }
    }
}