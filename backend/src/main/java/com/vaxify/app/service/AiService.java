package com.vaxify.app.service;

import com.vaxify.app.dtos.ai.AiAskRequest;
import com.vaxify.app.dtos.ai.AiAskResponse;

public interface AiService {

    AiAskResponse ask(AiAskRequest request);
}
