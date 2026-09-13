package com.vaxify.app.dtos.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAskResponse {

    private String status;

    private String answer;

    @Builder.Default
    private List<AiCitationDto> citations = new ArrayList<>();
}
