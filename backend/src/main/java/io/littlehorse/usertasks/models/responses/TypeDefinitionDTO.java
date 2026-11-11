package io.littlehorse.usertasks.models.responses;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.littlehorse.sdk.common.proto.TypeDefinition;
import io.littlehorse.sdk.common.proto.VariableType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * {@code TypeDefinitionDTO} is a Data Transfer Object that describes the type of a Struct field, array
 * element, or map key/value. Exactly one of {@code primitiveType}, {@code structDefId},
 * {@code inlineStructDef}, {@code inlineArrayDef}, or {@code inlineMapDef} is set.
 *
 * @see TypeDefinition
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(
        description = "Exactly one of primitiveType, structDefId, inlineStructDef, inlineArrayDef, or"
                + " inlineMapDef is set.")
public class TypeDefinitionDTO {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private VariableType primitiveType;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private StructDefIdDTO structDefId;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private InlineStructDefDTO inlineStructDef;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private InlineArrayDefDTO inlineArrayDef;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private InlineMapDefDTO inlineMapDef;

    @Schema(description = "Whether values of this type are hidden when read back")
    private boolean masked;

    public static TypeDefinitionDTO fromServer(@NonNull TypeDefinition typeDefinition) {
        var builder = TypeDefinitionDTO.builder().masked(typeDefinition.getMasked());

        switch (typeDefinition.getDefinedTypeCase()) {
            case PRIMITIVE_TYPE -> builder.primitiveType(typeDefinition.getPrimitiveType());
            case STRUCT_DEF_ID -> builder.structDefId(StructDefIdDTO.fromServer(typeDefinition.getStructDefId()));
            case INLINE_STRUCT_DEF ->
                builder.inlineStructDef(InlineStructDefDTO.fromServer(typeDefinition.getInlineStructDef()));
            case INLINE_ARRAY_DEF ->
                builder.inlineArrayDef(InlineArrayDefDTO.fromServer(typeDefinition.getInlineArrayDef()));
            case INLINE_MAP_DEF -> builder.inlineMapDef(InlineMapDefDTO.fromServer(typeDefinition.getInlineMapDef()));
            default -> {
                // A type this backend's SDK does not know; clients treat it as unsupported.
            }
        }

        return builder.build();
    }
}
