package com.vaxify.app.dtos.slot;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkSlotResponse {

    private int created;
    private int skipped;
    private List<SlotResponse> createdSlots;
}
