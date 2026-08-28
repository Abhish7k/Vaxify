package com.vaxify.app.dtos.slot;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BulkSlotRequest {

    @NotEmpty(message = "At least one slot is required")
    @Size(max = 62, message = "Cannot create more than 62 slots in one request")
    @Valid
    private List<SlotRequest> slots;
}
