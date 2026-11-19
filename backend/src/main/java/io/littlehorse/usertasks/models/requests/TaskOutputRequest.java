package io.littlehorse.usertasks.models.requests;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import tools.jackson.databind.JsonNode;

@Data
@Schema(description = "Struct-backed task submission. Send {} only for a task without a result schema.")
public class TaskOutputRequest {
    @Schema(
            type = "object",
            description = "LittleHorse VariableValue in protobuf JSON format, containing a Struct. "
                    + "The root StructDefId may be omitted; the backend assigns the run's pinned ID.",
            example = "{\"struct\":{\"struct\":{\"fields\":{\"approved\":{\"value\":{\"bool\":true}}}}}}")
    private JsonNode output;

    @JsonAnySetter
    public void rejectUnknownProperty(String name, JsonNode value) {
        throw new IllegalArgumentException("Only the output property is accepted");
    }
}
