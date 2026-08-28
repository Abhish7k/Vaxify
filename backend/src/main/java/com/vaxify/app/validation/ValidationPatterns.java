package com.vaxify.app.validation;

public final class ValidationPatterns {

    public static final String PHONE = "^[0-9]{10}$";
    public static final String PHONE_MESSAGE = "Enter a valid 10-digit phone number";

    public static final String PINCODE = "^[0-9]{6}$";
    public static final String PINCODE_MESSAGE = "Enter a valid 6-digit pincode";

    public static final String ISO_DATE = "^\\d{4}-\\d{2}-\\d{2}$";
    public static final String ISO_DATE_MESSAGE = "Date must be yyyy-MM-dd";

    public static final String TIME = "^\\d{2}:\\d{2}(:\\d{2})?$";
    public static final String TIME_MESSAGE = "Time must be HH:mm or HH:mm:ss";

    public static final int SLOT_CAPACITY_MAX = 10;
    public static final String SLOT_CAPACITY_MAX_MESSAGE = "Capacity cannot exceed 10";

    private ValidationPatterns() {
    }
}
