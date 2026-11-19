package io.littlehorse.usertasks.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.littlehorse.usertasks.configurations.CustomIdentityProviderProperties;
import io.littlehorse.usertasks.configurations.IdentityProviderConfigProperties;
import io.littlehorse.usertasks.models.requests.CompleteUserTaskRequest;
import io.littlehorse.usertasks.services.TenantService;
import io.littlehorse.usertasks.services.UserTaskService;
import io.littlehorse.usertasks.util.enums.CustomUserIdClaim;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class TaskOutputContractTest {
    private final UserTaskService tasks = mock();
    private MockMvc mvc;
    private final String token = "Bearer header."
            + Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(
                            "{\"iss\":\"https://issuer\",\"allowed_tenant\":\"tenant\",\"azp\":\"console\",\"sub\":\"owner\"}"
                                    .getBytes(StandardCharsets.UTF_8))
            + ".signature";

    @BeforeEach
    void setup() {
        var tenants = mock(TenantService.class);
        when(tenants.isValidTenant("tenant", token)).thenReturn(true);
        var configuration = new IdentityProviderConfigProperties();
        configuration.setOps(List.of(new CustomIdentityProviderProperties(
                URI.create("https://issuer"),
                "sub",
                CustomUserIdClaim.SUB,
                null,
                "test",
                "tenant",
                Set.of("console"),
                "azp",
                List.of())));
        // These tests exercise HTTP binding; authentication is covered by the application security tests.
        mvc = MockMvcBuilders.standaloneSetup(
                        new UserController(tenants, tasks, configuration),
                        new AdminController(tenants, tasks, configuration))
                .setControllerAdvice(new TaskExceptionHandler())
                .build();
    }

    @ParameterizedTest
    @ValueSource(strings = {"/tenant/tasks/run/task", "/tenant/admin/tasks/run/task"})
    void completionAndProgressBindOutputEnvelopeAndAuthenticatedIdentity(String path) throws Exception {
        String body =
                "{\"output\":{\"struct\":{\"struct\":{\"fields\":{\"count\":{\"value\":{\"int\":\"9223372036854775807\"}}}}}}}";
        boolean admin = path.contains("/admin/");
        mvc.perform(post(path + "/result")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNoContent());
        var complete = ArgumentCaptor.forClass(CompleteUserTaskRequest.class);
        verify(tasks).completeUserTask(eq("owner"), complete.capture(), eq("tenant"), eq(admin));
        assertEquals("run", complete.getValue().getWfRunId());
        assertEquals("task", complete.getValue().getUserTaskRunGuid());
        assertEquals(
                "9223372036854775807",
                complete.getValue()
                        .getOutput()
                        .at("/struct/struct/fields/count/value/int")
                        .asText());

        mvc.perform(post(path + "/progress")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNoContent());
        verify(tasks).saveUserTaskProgress(eq("owner"), any(), eq("tenant"), eq(admin));
    }

    @ParameterizedTest
    @ValueSource(
            strings = {
                "/tenant/tasks/run/task/result",
                "/tenant/admin/tasks/run/task/result",
                "/tenant/tasks/run/task/progress",
                "/tenant/admin/tasks/run/task/progress"
            })
    void oldPayloadAndClientSuppliedIdentityAreRejected(String path) throws Exception {
        for (String body : List.of(
                "{\"approved\":{\"type\":\"BOOLEAN\",\"value\":true}}",
                "{\"results\":{}}",
                "{\"output\":{\"struct\":{}},\"userId\":\"other\"}")) {
            mvc.perform(post(path)
                            .header("Authorization", token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }
        verifyNoInteractions(tasks);
    }
}
