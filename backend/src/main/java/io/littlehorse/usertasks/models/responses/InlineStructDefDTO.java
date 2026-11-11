package io.littlehorse.usertasks.models.responses;

import io.littlehorse.sdk.common.proto.InlineStructDef;
import jakarta.validation.constraints.NotNull;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * {@code InlineStructDefDTO} is a Data Transfer Object that contains the fields of a Struct schema
 *
 * @see InlineStructDef
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InlineStructDefDTO {
    @NotNull
    private Map<String, StructFieldDefDTO> fields;

    public static InlineStructDefDTO fromServer(@NonNull InlineStructDef inlineStructDef) {
        Map<String, StructFieldDefDTO> fields = new LinkedHashMap<>();
        inlineStructDef
                .getFieldsMap()
                .forEach((name, fieldDef) -> fields.put(name, StructFieldDefDTO.fromServer(fieldDef)));

        return InlineStructDefDTO.builder().fields(fields).build();
    }
}
