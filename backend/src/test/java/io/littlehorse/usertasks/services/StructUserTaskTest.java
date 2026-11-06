package io.littlehorse.usertasks.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import io.grpc.Status;
import io.littlehorse.sdk.common.proto.*;
import io.littlehorse.usertasks.models.requests.CompleteUserTaskRequest;
import io.littlehorse.usertasks.util.ProtobufJson;
import io.littlehorse.usertasks.util.enums.UserTaskEventType;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.json.JsonMapper;

class StructUserTaskTest {
    private final LittleHorseGrpc.LittleHorseBlockingStub client = mock();
    private final UserTaskService service = new UserTaskService(Map.of("tenant", client));
    private final StructDefId pinned =
            StructDefId.newBuilder().setName("form").setVersion(3).build();
    private final UserTaskDefId definitionId =
            UserTaskDefId.newBuilder().setName("approval").setVersion(2).build();
    private final UserTaskRunId runId = UserTaskRunId.newBuilder()
            .setWfRunId(WfRunId.newBuilder().setId("run"))
            .setUserTaskGuid("task")
            .build();
    private UserTaskRun run;

    @BeforeEach
    void setup() {
        run = UserTaskRun.newBuilder()
                .setId(runId)
                .setUserTaskDefId(definitionId)
                .setResultStructDefId(pinned)
                .setUserId("owner")
                .setStatus(UserTaskRunStatus.ASSIGNED)
                .build();
        when(client.getUserTaskRun(runId)).thenReturn(run);
        when(client.getUserTaskDef(definitionId))
                .thenReturn(UserTaskDef.newBuilder()
                        .setName("approval")
                        .setVersion(2)
                        .setResultStructDefId(pinned.toBuilder().setVersion(1))
                        .build());
        when(client.getStructDef(pinned))
                .thenReturn(StructDef.newBuilder().setId(pinned).build());
    }

    @Test
    void detailsResolvePinnedVersionAndNestedReferencesOnceEvenWithCycles() {
        var childId = StructDefId.newBuilder().setName("address").setVersion(4).build();
        var childType = TypeDefinition.newBuilder().setStructDefId(childId).build();
        var root = StructDef.newBuilder()
                .setId(pinned)
                .setStructDef(InlineStructDef.newBuilder()
                        .putFields("address", field(childType))
                        .putFields(
                                "addresses",
                                field(TypeDefinition.newBuilder()
                                        .setInlineArrayDef(
                                                InlineArrayDef.newBuilder().setArrayType(childType))
                                        .build()))
                        .putFields(
                                "directory",
                                field(TypeDefinition.newBuilder()
                                        .setInlineMapDef(InlineMapDef.newBuilder()
                                                .setKeyType(TypeDefinition.newBuilder()
                                                        .setPrimitiveType(VariableType.STR))
                                                .setValueType(childType))
                                        .build())))
                .build();
        var child = StructDef.newBuilder()
                .setId(childId)
                .setStructDef(InlineStructDef.newBuilder()
                        .putFields(
                                "parent",
                                field(TypeDefinition.newBuilder()
                                        .setStructDefId(pinned)
                                        .build())))
                .build();
        when(client.getStructDef(pinned)).thenReturn(root);
        when(client.getStructDef(childId)).thenReturn(child);

        var details = service.getUserTaskDetails("run", "task", "tenant", "owner", null, false)
                .orElseThrow();

        assertEquals(ProtobufJson.write(pinned), details.getResultStructDefId());
        assertEquals(2, details.getStructDefs().size());
        verify(client).getStructDef(pinned);
        verify(client).getStructDef(childId);
        verify(client, never()).getStructDef(pinned.toBuilder().setVersion(1).build());
    }

    @Test
    void completeUsesOutputAndPinsMissingIdWithoutFlatteningOrApplyingDefaults() {
        var original = output(
                "{\"struct\":{\"struct\":{\"fields\":{\"count\":{\"value\":{\"int\":\"9223372036854775807\"}},\"optional\":{\"value\":{}}}}}}");
        service.completeUserTask("owner", original, "tenant", false);
        var request = ArgumentCaptor.forClass(CompleteUserTaskRunRequest.class);
        verify(client).completeUserTaskRun(request.capture());
        assertEquals(pinned, request.getValue().getOutput().getStruct().getStructDefId());
        assertEquals(
                Long.MAX_VALUE,
                request.getValue()
                        .getOutput()
                        .getStruct()
                        .getStruct()
                        .getFieldsOrThrow("count")
                        .getValue()
                        .getInt());
        assertEquals(2, request.getValue().getOutput().getStruct().getStruct().getFieldsCount());
        assertTrue(request.getValue().getResultsMap().isEmpty());
        verify(client).getUserTaskDef(definitionId);
    }

    @Test
    void acceptsDecimalStringsFromFormWithoutChangingTheirNumericValue() {
        var submitted = output("""
                {"struct":{"struct":{"fields":{"amount":{"value":{"double":"-1.25"}}}}}}
                """);
        service.completeUserTask("owner", submitted, "tenant", false);
        var request = ArgumentCaptor.forClass(CompleteUserTaskRunRequest.class);
        verify(client).completeUserTaskRun(request.capture());
        assertEquals(
                -1.25,
                request.getValue()
                        .getOutput()
                        .getStruct()
                        .getStruct()
                        .getFieldsOrThrow("amount")
                        .getValue()
                        .getDouble());
    }

    @Test
    void saveAcceptsEmptySnapshotToClearDraftAndDoesNotComplete() {
        service.saveUserTaskProgress("owner", output("{\"struct\":{\"struct\":{\"fields\":{}}}}"), "tenant", false);
        var request = ArgumentCaptor.forClass(SaveUserTaskRunProgressRequest.class);
        verify(client).saveUserTaskRunProgress(request.capture());
        assertEquals(pinned, request.getValue().getOutput().getStruct().getStructDefId());
        assertEquals(0, request.getValue().getOutput().getStruct().getStruct().getFieldsCount());
        assertEquals(
                SaveUserTaskRunProgressRequest.SaveUserTaskRunAssignmentPolicy.FAIL_IF_CLAIMED_BY_OTHER,
                request.getValue().getPolicy());
        assertEquals("owner", request.getValue().getUserId());
        verify(client, never()).completeUserTaskRun(any());
    }

    @Test
    void adminCanSaveWithOverrideAndRecordsAdminIdentity() {
        service.saveUserTaskProgress("admin", output("{\"struct\":{}}"), "tenant", true);
        var request = ArgumentCaptor.forClass(SaveUserTaskRunProgressRequest.class);
        verify(client).saveUserTaskRunProgress(request.capture());
        assertEquals(
                SaveUserTaskRunProgressRequest.SaveUserTaskRunAssignmentPolicy.IGNORE_CLAIM,
                request.getValue().getPolicy());
        assertEquals("admin", request.getValue().getUserId());
    }

    @Test
    void saveRejectsDifferentOwnerAndTerminatedTasks() {
        assertThrows(
                io.littlehorse.usertasks.exceptions.CustomUnauthorizedException.class,
                () -> service.saveUserTaskProgress("other", output("{\"struct\":{}}"), "tenant", false));
        when(client.getUserTaskRun(runId))
                .thenReturn(run.toBuilder()
                        .clearUserId()
                        .setUserGroup("other-group")
                        .setStatus(UserTaskRunStatus.UNASSIGNED)
                        .build());
        assertThrows(
                io.littlehorse.usertasks.exceptions.CustomUnauthorizedException.class,
                () -> service.saveUserTaskProgress("owner", output("{\"struct\":{}}"), "tenant", false));
        when(client.getUserTaskRun(runId))
                .thenReturn(run.toBuilder().setStatus(UserTaskRunStatus.DONE).build());
        assertEquals(
                HttpStatus.FORBIDDEN,
                assertThrows(
                                ResponseStatusException.class,
                                () -> service.saveUserTaskProgress("admin", output("{\"struct\":{}}"), "tenant", true))
                        .getStatusCode());
        verify(client, never()).saveUserTaskRunProgress(any());
    }

    @Test
    void rejectsWrongSchemaPrimitiveAndMissingOutputBeforeCallingKernel() {
        for (String json : new String[] {
            "{}",
            "{\"str\":\"wrong\"}",
            "{\"struct\":{\"structDefId\":{\"name\":\"form\",\"version\":1}}}",
            "{\"struct\":{},\"bool\":true}",
            "{\"unknown\":true}"
        }) {
            assertEquals(
                    HttpStatus.BAD_REQUEST,
                    assertThrows(
                                    ResponseStatusException.class,
                                    () -> service.completeUserTask("owner", output(json), "tenant", false))
                            .getStatusCode());
        }
        verify(client, never()).completeUserTaskRun(any());
    }

    @Test
    void mapsKernelValidationAndAssignmentConflicts() {
        when(client.saveUserTaskRunProgress(any()))
                .thenThrow(
                        Status.INVALID_ARGUMENT.withDescription("Invalid field").asRuntimeException());
        assertEquals(
                HttpStatus.BAD_REQUEST,
                assertThrows(
                                ResponseStatusException.class,
                                () -> service.saveUserTaskProgress("owner", output("{\"struct\":{}}"), "tenant", false))
                        .getStatusCode());
        doThrow(Status.FAILED_PRECONDITION.asRuntimeException()).when(client).saveUserTaskRunProgress(any());
        assertEquals(
                HttpStatus.CONFLICT,
                assertThrows(
                                ResponseStatusException.class,
                                () -> service.saveUserTaskProgress("owner", output("{\"struct\":{}}"), "tenant", false))
                        .getStatusCode());
    }

    @Test
    void noSchemaTaskCompletesWithoutOutputButCannotSave() {
        when(client.getUserTaskRun(runId))
                .thenReturn(run.toBuilder().clearResultStructDefId().build());
        when(client.getUserTaskDef(definitionId)).thenReturn(UserTaskDef.getDefaultInstance());
        var request = CompleteUserTaskRequest.builder()
                .wfRunId("run")
                .userTaskRunGuid("task")
                .build();
        service.completeUserTask("owner", request, "tenant", false);
        var sent = ArgumentCaptor.forClass(CompleteUserTaskRunRequest.class);
        verify(client).completeUserTaskRun(sent.capture());
        assertFalse(sent.getValue().hasOutput());
        assertThrows(
                ResponseStatusException.class, () -> service.saveUserTaskProgress("owner", request, "tenant", false));
    }

    @Test
    void legacyDefinitionIsExplicitlyUnsupported() {
        when(client.getUserTaskDef(definitionId))
                .thenReturn(UserTaskDef.newBuilder()
                        .addFields(UserTaskField.newBuilder().setName("old").setType(VariableType.STR))
                        .build());
        assertEquals(
                HttpStatus.UNPROCESSABLE_ENTITY,
                assertThrows(
                                ResponseStatusException.class,
                                () -> service.completeUserTask("owner", output("{\"struct\":{}}"), "tenant", false))
                        .getStatusCode());
    }

    @Test
    void savedAuditAndDraftPreserveNestedValuesNullAndMaskMetadata() {
        var json = JsonMapper.builder().build().readTree("""
                {"struct":{"struct":{"fields":{
                  "secret":{"value":{"str":"***"},"masked":true},
                  "nested":{"value":{"struct":{"struct":{"fields":{"nullable":{"value":{}}}}}}},
                  "items":{"value":{"array":{"items":[{"int":"9223372036854775807"}],"elementType":{"primitiveType":"INT"}}}},
                  "map":{"value":{"map":{"entries":[{"key":{"int":"42"},"value":{"bool":false}}],"mapType":{"keyType":{"primitiveType":"INT"},"valueType":{"primitiveType":"BOOL"}}}}}
                }}}}
                """);
        var output = ProtobufJson.readOutput(json, pinned);
        var event = UserTaskEvent.newBuilder()
                .setSaved(UserTaskEvent.UTESaved.newBuilder().setUserId("owner").setOutput(output))
                .build();
        when(client.getUserTaskRun(runId))
                .thenReturn(run.toBuilder().setOutput(output).addEvents(event).build());
        var details = service.getUserTaskDetails("run", "task", "tenant", null, null, true)
                .orElseThrow();
        assertEquals(output, ProtobufJson.readOutput(details.getOutput(), pinned));
        assertTrue(details.getOutput().at("/struct/struct/fields/secret/masked").asBoolean());
        assertEquals(
                "9223372036854775807",
                details.getOutput()
                        .at("/struct/struct/fields/items/value/array/items/0/int")
                        .asText());
        var audit = details.getEvents().iterator().next();
        assertEquals(UserTaskEventType.TASK_SAVED, audit.getType());
        var serialized = JsonMapper.builder().build().valueToTree(audit);
        assertEquals(details.getOutput(), serialized.at("/event/output"));
    }

    private CompleteUserTaskRequest output(String json) {
        return CompleteUserTaskRequest.builder()
                .wfRunId("run")
                .userTaskRunGuid("task")
                .output(JsonMapper.builder().build().readTree(json))
                .build();
    }

    private StructFieldDef field(TypeDefinition type) {
        return StructFieldDef.newBuilder().setFieldType(type).build();
    }
}
