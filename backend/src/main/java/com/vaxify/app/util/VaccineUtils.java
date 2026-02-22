package com.vaxify.app.util;

import com.vaxify.app.entities.Vaccine;

public class VaccineUtils {

    public static boolean isStockCritical(Vaccine v) {
        if (v == null || v.getCapacity() == null || v.getCapacity() <= 0) {
            return false;
        }

        return v.getStock() < (v.getCapacity() * 0.2);
    }

    public static boolean isStockLow(Vaccine v) {
        if (v == null || v.getCapacity() == null || v.getCapacity() <= 0) {
            return false;
        }

        return v.getStock() < (v.getCapacity() * 0.4);
    }
}
