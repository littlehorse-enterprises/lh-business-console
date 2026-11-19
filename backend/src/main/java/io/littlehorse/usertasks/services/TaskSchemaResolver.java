package io.littlehorse.usertasks.services;

import io.littlehorse.sdk.common.proto.*;
import java.util.*;
import java.util.Map;

/** Resolves a run's exact schema and the named definitions referenced by its fields. */
final class TaskSchemaResolver {
    private TaskSchemaResolver() {}

    static List<StructDef> resolve(LittleHorseGrpc.LittleHorseBlockingStub client, StructDefId root) {
        Map<StructDefId, StructDef> definitions = new LinkedHashMap<>();
        Deque<StructDefId> pending = new ArrayDeque<>();
        pending.add(root);
        while (!pending.isEmpty()) {
            var id = pending.removeFirst();
            if (definitions.containsKey(id)) continue;
            var definition = client.getStructDef(id);
            definitions.put(id, definition);
            collectReferences(definition.getStructDef(), pending);
        }
        return List.copyOf(definitions.values());
    }

    private static void collectReferences(InlineStructDef definition, Deque<StructDefId> pending) {
        definition.getFieldsMap().values().forEach(field -> collectReferences(field.getFieldType(), pending));
    }

    private static void collectReferences(TypeDefinition type, Deque<StructDefId> pending) {
        switch (type.getDefinedTypeCase()) {
            case STRUCT_DEF_ID -> pending.add(type.getStructDefId());
            case INLINE_STRUCT_DEF -> collectReferences(type.getInlineStructDef(), pending);
            case INLINE_ARRAY_DEF -> collectReferences(type.getInlineArrayDef().getArrayType(), pending);
            case INLINE_MAP_DEF -> {
                collectReferences(type.getInlineMapDef().getKeyType(), pending);
                collectReferences(type.getInlineMapDef().getValueType(), pending);
            }
            default -> {}
        }
    }
}
