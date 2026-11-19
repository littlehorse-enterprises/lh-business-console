package io.littlehorse.usertasks.models.responses;

import io.littlehorse.sdk.common.proto.InlineArrayDef;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * {@code InlineArrayDefDTO} is a Data Transfer Object that describes the element type of an array
 *
 * @see InlineArrayDef
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InlineArrayDefDTO {
    @NotNull
    private TypeDefinitionDTO arrayType;

    public static InlineArrayDefDTO fromServer(@NonNull InlineArrayDef inlineArrayDef) {
        return InlineArrayDefDTO.builder()
                .arrayType(TypeDefinitionDTO.fromServer(inlineArrayDef.getArrayType()))
                .build();
    }
}
