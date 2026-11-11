package io.littlehorse.usertasks.models.responses;

import static io.littlehorse.usertasks.util.DateUtil.timestampToLocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.littlehorse.sdk.common.proto.StructDef;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * {@code StructDefDTO} is a Data Transfer Object that contains the schema of a specific
 * {@code io.littlehorse.sdk.common.proto.StructDef}
 *
 * @see StructDef
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StructDefDTO {
    @NotNull
    private StructDefIdDTO id;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String description;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime createdAt;

    @NotNull
    private InlineStructDefDTO structDef;

    public static StructDefDTO fromServer(@NonNull StructDef structDef) {
        return StructDefDTO.builder()
                .id(StructDefIdDTO.fromServer(structDef.getId()))
                .description(structDef.hasDescription() ? structDef.getDescription() : null)
                .createdAt(structDef.hasCreatedAt() ? timestampToLocalDateTime(structDef.getCreatedAt()) : null)
                .structDef(InlineStructDefDTO.fromServer(structDef.getStructDef()))
                .build();
    }
}
