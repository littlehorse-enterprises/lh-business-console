package io.littlehorse.usertasks.models.requests;

import io.littlehorse.sdk.common.proto.CompleteUserTaskRunRequest;
import io.littlehorse.sdk.common.proto.StructDefId;
import io.littlehorse.sdk.common.proto.UserTaskRunId;
import io.littlehorse.sdk.common.proto.WfRunId;
import io.littlehorse.usertasks.util.ProtobufJson;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import tools.jackson.databind.JsonNode;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteUserTaskRequest {
    @NotBlank
    private String wfRunId;

    @NotBlank
    private String userTaskRunGuid;

    private JsonNode output;

    public CompleteUserTaskRunRequest toServerRequest(@NonNull String userId, StructDefId schemaId) {
        var request = CompleteUserTaskRunRequest.newBuilder()
                .setUserId(userId)
                .setUserTaskRunId(UserTaskRunId.newBuilder()
                        .setWfRunId(WfRunId.newBuilder().setId(getWfRunId()))
                        .setUserTaskGuid(getUserTaskRunGuid()));
        var value = ProtobufJson.readOutput(output, schemaId);
        if (value != null) request.setOutput(value);
        return request.build();
    }
}
