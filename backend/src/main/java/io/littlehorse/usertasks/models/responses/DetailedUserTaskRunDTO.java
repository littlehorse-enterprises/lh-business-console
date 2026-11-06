package io.littlehorse.usertasks.models.responses;

import static io.littlehorse.usertasks.util.DateUtil.timestampToLocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.littlehorse.sdk.common.proto.UserTaskRun;
import io.littlehorse.usertasks.idp_adapters.IStandardIdentityProviderAdapter;
import io.littlehorse.usertasks.models.common.UserDTO;
import io.littlehorse.usertasks.models.common.UserGroupDTO;
import io.littlehorse.usertasks.util.ProtobufJson;
import io.littlehorse.usertasks.util.enums.UserTaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import tools.jackson.databind.JsonNode;

/**
 * {@code DetailedUserTaskRunDTO} is a Data Transfer Object that contains detailed information about a
 * specific {@code io.littlehorse.sdk.common.proto.UserTaskRun} and its respective {@code io.littlehorse.sdk.common.proto.UserTaskDef}
 *
 * @see io.littlehorse.sdk.common.proto.UserTaskRun
 * @see io.littlehorse.sdk.common.proto.UserTaskDef
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailedUserTaskRunDTO {
    @NotBlank
    private String id;

    @NotBlank
    private String wfRunId;

    @NotBlank
    private String userTaskDefName;

    private UserGroupDTO userGroup;
    private UserDTO user;

    @NotNull
    private UserTaskStatus status;

    private String notes;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime scheduledTime;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "The exact StructDefId pinned to this run, in protobuf JSON format")
    private JsonNode resultStructDefId;

    @NotNull
    @Schema(description = "Root StructDef followed by referenced named StructDefs, in protobuf JSON format")
    private List<JsonNode> structDefs;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Current Struct VariableValue in protobuf JSON format; may be incomplete before completion")
    private JsonNode output;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Set<AuditEventDTO> events;

    public static DetailedUserTaskRunDTO fromUserTaskRun(@NonNull UserTaskRun userTaskRun) {
        return DetailedUserTaskRunDTO.builder()
                .id(userTaskRun.getId().getUserTaskGuid())
                .wfRunId(userTaskRun.getId().getWfRunId().getId())
                .userTaskDefName(userTaskRun.getUserTaskDefId().getName())
                .user(UserDTO.partiallyBuildFromUserTaskRun(userTaskRun))
                .userGroup(UserGroupDTO.partiallyBuildFromUserTaskRun(userTaskRun))
                .notes(userTaskRun.getNotes())
                .status(UserTaskStatus.fromServerStatus(userTaskRun.getStatus()))
                .scheduledTime(timestampToLocalDateTime(userTaskRun.getScheduledTime()))
                .resultStructDefId(
                        userTaskRun.hasResultStructDefId()
                                ? ProtobufJson.write(userTaskRun.getResultStructDefId())
                                : null)
                .structDefs(List.of())
                .output(userTaskRun.hasOutput() ? ProtobufJson.write(userTaskRun.getOutput()) : null)
                .build();
    }

    public void addAssignmentDetails(
            @NonNull String accessToken, @NonNull IStandardIdentityProviderAdapter identityProviderHandler) {
        Map<String, Object> params = new HashMap<>();
        params.put("accessToken", accessToken);

        addAssignedUserInfo(identityProviderHandler, this, params);
        addAssignedUserGroupInfo(identityProviderHandler, this, params);
    }

    private void addAssignedUserInfo(
            IStandardIdentityProviderAdapter identityProviderHandler,
            DetailedUserTaskRunDTO detailedUserTaskRunDTO,
            Map<String, Object> params) {
        if (Objects.nonNull(detailedUserTaskRunDTO.getUser())) {
            params.put("userId", detailedUserTaskRunDTO.getUser().getId());
            UserDTO userDTO = identityProviderHandler.getUserInfo(params);

            if (Objects.nonNull(userDTO)) {
                detailedUserTaskRunDTO.setUser(userDTO);
            } else {
                detailedUserTaskRunDTO.setUser(UserDTO.builder()
                        .id(detailedUserTaskRunDTO.getUser().getId())
                        .valid(false)
                        .build());
            }
        }
    }

    private void addAssignedUserGroupInfo(
            IStandardIdentityProviderAdapter identityProviderHandler,
            DetailedUserTaskRunDTO detailedUserTaskRunDTO,
            Map<String, Object> params) {
        if (Objects.nonNull(detailedUserTaskRunDTO.getUserGroup())) {
            params.put("userGroupName", detailedUserTaskRunDTO.getUserGroup().getId());
            UserGroupDTO userGroupDTO = identityProviderHandler.getUserGroup(params);

            if (Objects.nonNull(userGroupDTO)) {
                detailedUserTaskRunDTO.setUserGroup(userGroupDTO);
            } else {
                detailedUserTaskRunDTO.setUserGroup(UserGroupDTO.builder()
                        .id(detailedUserTaskRunDTO.getUserGroup().getId())
                        .valid(false)
                        .build());
            }
        }
    }
}
