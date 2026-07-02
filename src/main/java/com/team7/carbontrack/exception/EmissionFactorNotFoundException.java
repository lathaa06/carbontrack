package com.team7.carbontrack.exception;

/**
 * Thrown when an activity log is submitted for an (category, activityType, unit)
 * combination that has no configured emission factor. Kept distinct from a plain
 * 404 so the client can prompt the user to pick a supported activity type.
 */
public class EmissionFactorNotFoundException extends RuntimeException {
    public EmissionFactorNotFoundException(String message) {
        super(message);
    }
}
