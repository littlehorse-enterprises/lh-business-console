package io.littlehorse.usertasks.models.responses;

import io.littlehorse.sdk.common.proto.StructDefId;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * {@code StructDefIdDTO} is a Data Transfer Object that identifies an exact version of a
 * {@code io.littlehorse.sdk.common.proto.StructDef}
 *
 * @see StructDefId
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StructDefIdDTO {
    @NotBlank
    private String name;

    /** Always present, including version 0, which protobuf JSON would omit. */
    private int version;

    public static StructDefIdDTO fromServer(@NonNull StructDefId structDefId) {
        return StructDefIdDTO.builder()
                .name(structDefId.getName())
                .version(structDefId.getVersion())
                .build();
    }
}
