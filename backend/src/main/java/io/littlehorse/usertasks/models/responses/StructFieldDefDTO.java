package io.littlehorse.usertasks.models.responses;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.littlehorse.sdk.common.proto.StructFieldDef;
import io.littlehorse.usertasks.util.ProtobufJson;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import tools.jackson.databind.JsonNode;

/**
 * {@code StructFieldDefDTO} is a Data Transfer Object that describes one field of a Struct schema
 *
 * @see StructFieldDef
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StructFieldDefDTO {
    @NotNull
    private TypeDefinitionDTO fieldType;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(
            type = "object",
            description = "Default LittleHorse VariableValue in protobuf JSON format. A field with a default is"
                    + " optional when completing the task.")
    private JsonNode defaultValue;

    @JsonProperty("isNullable")
    private boolean nullable;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String description;

    public static StructFieldDefDTO fromServer(@NonNull StructFieldDef fieldDef) {
        return StructFieldDefDTO.builder()
                .fieldType(TypeDefinitionDTO.fromServer(fieldDef.getFieldType()))
                .defaultValue(fieldDef.hasDefaultValue() ? ProtobufJson.write(fieldDef.getDefaultValue()) : null)
                .nullable(fieldDef.getIsNullable())
                .description(fieldDef.hasDescription() ? fieldDef.getDescription() : null)
                .build();
    }
}
