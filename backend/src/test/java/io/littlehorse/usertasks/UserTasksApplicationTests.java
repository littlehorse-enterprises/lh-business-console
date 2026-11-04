package io.littlehorse.usertasks;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.littlehorse.usertasks.models.requests.CreateGroupRequest;
import io.littlehorse.usertasks.models.responses.DetailedUserTaskRunDTO;
import io.littlehorse.usertasks.util.enums.UserTaskStatus;
import jakarta.validation.Validator;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
class UserTasksApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @Autowired
    private Validator validator;

    @Test
    void contextLoads() {}

    @Test
    void publicConfigurationAllowsAnonymousRequests() throws Exception {
        mockMvc.perform(get("/config/default")).andExpect(status().isOk());
    }

    @Test
    void protectedEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/user-tasks")).andExpect(status().isUnauthorized());
    }

    @Test
    void openApiDocumentationAllowsAnonymousRequests() throws Exception {
        mockMvc.perform(get("/api-docs")).andExpect(status().isOk());
    }

    @Test
    void taskJsonPreservesDatesEnumsAndNullExclusions() {
        var task = DetailedUserTaskRunDTO.builder()
                .id("task-1")
                .wfRunId("run-1")
                .userTaskDefName("approval")
                .status(UserTaskStatus.ASSIGNED)
                .scheduledTime(LocalDateTime.of(2026, 11, 4, 12, 30))
                .fields(List.of())
                .build();

        var json = jsonMapper.readTree(jsonMapper.writeValueAsString(task));

        assertEquals("task-1", json.get("id").asText());
        assertEquals("ASSIGNED", json.get("status").asText());
        assertEquals("2026-11-04T12:30:00.000Z", json.get("scheduledTime").asText());
        assertFalse(json.has("results"));
        assertFalse(json.has("events"));
    }

    @Test
    void requestValidationRemainsEnabled() {
        assertFalse(validator.validate(new CreateGroupRequest(" ")).isEmpty());
        assertTrue(validator.validate(new CreateGroupRequest("Reviewers")).isEmpty());
    }
}
