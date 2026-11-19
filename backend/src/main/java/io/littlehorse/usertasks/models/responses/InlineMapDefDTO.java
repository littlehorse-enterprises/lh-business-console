package io.littlehorse.usertasks.models.responses;

import io.littlehorse.sdk.common.proto.InlineMapDef;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * {@code InlineMapDefDTO} is a Data Transfer Object that describes the key and value types of a map
 *
 * @see InlineMapDef
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InlineMapDefDTO {
    @NotNull
    private TypeDefinitionDTO keyType;

    @NotNull
    private TypeDefinitionDTO valueType;

    public static InlineMapDefDTO fromServer(@NonNull InlineMapDef inlineMapDef) {
        return InlineMapDefDTO.builder()
                .keyType(TypeDefinitionDTO.fromServer(inlineMapDef.getKeyType()))
                .valueType(TypeDefinitionDTO.fromServer(inlineMapDef.getValueType()))
                .build();
    }
}
