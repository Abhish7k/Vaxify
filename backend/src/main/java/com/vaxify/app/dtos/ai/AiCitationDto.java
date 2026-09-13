package com.vaxify.app.dtos.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiCitationDto {

    private String source;

    private String sourceId;

    private String sourcePath;

    private Integer pageStart;

    private Integer pageEnd;

    private String section;

    private String topic;

    private String preview;
}
