package io.littlehorse.usertasks.util;

import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.MessageOrBuilder;
import com.google.protobuf.util.JsonFormat;
import io.littlehorse.sdk.common.proto.StructDefId;
import io.littlehorse.sdk.common.proto.VariableValue;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Protobuf JSON preserves int64 strings, value presence, and recursive type metadata. */
public final class ProtobufJson {
    private static final JsonMapper JSON = JsonMapper.builder().build();

    private ProtobufJson() {}

    public static JsonNode write(MessageOrBuilder message) {
        try {
            return JSON.readTree(JsonFormat.printer().print(message));
        } catch (InvalidProtocolBufferException e) {
            throw new IllegalStateException("Unable to serialize LittleHorse data", e);
        }
    }

    public static VariableValue readOutput(JsonNode json, StructDefId schemaId) {
        if (schemaId == null) {
            if (json != null && !json.isNull()) {
                throw badRequest("This task does not define an output");
            }
            return null;
        }
        if (json == null || !json.isObject()) {
            throw badRequest("output must contain a Struct VariableValue");
        }
        var builder = VariableValue.newBuilder();
        try {
            JsonFormat.parser().merge(json.toString(), builder);
        } catch (InvalidProtocolBufferException e) {
            // Do not echo submitted values, which may contain sensitive fields.
            throw badRequest("Invalid output: expected LittleHorse VariableValue protobuf JSON");
        }
        if (!builder.hasStruct()) {
            throw badRequest("output must contain a Struct VariableValue");
        }
        var struct = builder.getStruct().toBuilder();
        if (struct.hasStructDefId() && !struct.getStructDefId().equals(schemaId)) {
            throw badRequest("output must use the task run's resolved StructDefId");
        }
        struct.setStructDefId(schemaId);
        return builder.setStruct(struct).build();
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
