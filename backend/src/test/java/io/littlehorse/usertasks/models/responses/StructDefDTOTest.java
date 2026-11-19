package io.littlehorse.usertasks.models.responses;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.google.protobuf.util.JsonFormat;
import io.littlehorse.sdk.common.proto.StructDef;
import io.littlehorse.sdk.common.proto.StructDefId;
import io.littlehorse.sdk.common.proto.TypeDefinition;
import io.littlehorse.sdk.common.proto.VariableType;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

class StructDefDTOTest {
    private final JsonMapper mapper = JsonMapper.builder().build();

    private JsonNode serialize(String structDefProtobufJson) throws Exception {
        var schema = StructDef.newBuilder();
        JsonFormat.parser().merge(structDefProtobufJson, schema);
        return mapper.valueToTree(StructDefDTO.fromServer(schema.build()));
    }

    @Test
    void mapsRecursiveSchema() throws Exception {
        JsonNode json = serialize("""
                {
                  "id": {"name": "form", "version": 3},
                  "description": "Review form",
                  "createdAt": "2026-11-11T01:02:03.123Z",
                  "structDef": {"fields": {
                    "nested": {"fieldType": {"inlineStructDef": {"fields": {
                      "name": {"fieldType": {"primitiveType": "STR", "masked": true}, "description": "Name"}
                    }}}},
                    "array": {"fieldType": {"inlineArrayDef": {"arrayType": {"structDefId": {"name": "child", "version": 2}}}}},
                    "map": {"fieldType": {"inlineMapDef": {"keyType": {"primitiveType": "STR"}, "valueType": {"primitiveType": "INT"}}}},
                    "count": {"fieldType": {"primitiveType": "INT"}, "defaultValue": {"int": "9223372036854775807"}, "isNullable": true}
                  }}
                }
                """);

        assertEquals(mapper.readTree("""
                {
                  "id": {"name": "form", "version": 3},
                  "description": "Review form",
                  "createdAt": "2026-11-11T01:02:03.123Z",
                  "structDef": {"fields": {
                    "nested": {"isNullable": false, "fieldType": {"masked": false, "inlineStructDef": {"fields": {
                      "name": {"isNullable": false, "description": "Name", "fieldType": {"primitiveType": "STR", "masked": true}}
                    }}}},
                    "array": {"isNullable": false, "fieldType": {"masked": false, "inlineArrayDef": {
                      "arrayType": {"masked": false, "structDefId": {"name": "child", "version": 2}}}}},
                    "map": {"isNullable": false, "fieldType": {"masked": false, "inlineMapDef": {
                      "keyType": {"primitiveType": "STR", "masked": false},
                      "valueType": {"primitiveType": "INT", "masked": false}}}},
                    "count": {"isNullable": true, "defaultValue": {"int": "9223372036854775807"},
                      "fieldType": {"primitiveType": "INT", "masked": false}}
                  }}
                }
                """), json);
    }

    @Test
    void keepsFieldOrderOfTheSchema() throws Exception {
        JsonNode fields = serialize("""
                {"id": {"name": "form"}, "structDef": {"fields": {
                  "zebra": {"fieldType": {"primitiveType": "STR"}},
                  "apple": {"fieldType": {"primitiveType": "STR"}}
                }}}
                """).get("structDef").get("fields");

        assertEquals(java.util.List.of("zebra", "apple"), java.util.List.copyOf(fields.propertyNames()));
    }

    @Test
    void alwaysIncludesVersionZero() {
        // Protobuf JSON omits zero-valued fields, so the first version of a StructDef would have no version.
        JsonNode json = mapper.valueToTree(StructDefIdDTO.fromServer(
                StructDefId.newBuilder().setName("form").build()));

        assertEquals("form", json.get("name").asString());
        assertTrue(json.has("version"));
        assertEquals(0, json.get("version").asInt());
    }

    @Test
    void omitsAbsentOptionalProperties() {
        JsonNode definition = mapper.valueToTree(StructDefDTO.fromServer(StructDef.newBuilder()
                .setId(StructDefId.newBuilder().setName("form"))
                .build()));
        assertFalse(definition.has("description"));
        assertFalse(definition.has("createdAt"));
        assertTrue(definition.get("structDef").get("fields").isEmpty());

        JsonNode type = mapper.valueToTree(TypeDefinitionDTO.fromServer(
                TypeDefinition.newBuilder().setPrimitiveType(VariableType.BOOL).build()));
        assertEquals(java.util.Set.of("primitiveType", "masked"), java.util.Set.copyOf(type.propertyNames()));
    }
}
