package io.littlehorse;

import io.littlehorse.sdk.common.config.LHConfig;
import io.littlehorse.sdk.common.proto.LittleHorseGrpc;
import io.littlehorse.sdk.common.proto.*;
import io.littlehorse.sdk.wfsdk.WfRunVariable;
import io.littlehorse.sdk.wfsdk.Workflow;
import io.littlehorse.sdk.wfsdk.internal.WorkflowImpl;

public class Main {

    public static final String USER_VAR = "user";
    private static final String USER_TASKS_FORM = "user-tasks-form";
    private static final String GROUP_VAR = "group";
    private static final Workflow workflow = new WorkflowImpl("user-tasks-bridge-demo", wf -> {
        WfRunVariable group = wf.addVariable(GROUP_VAR, VariableType.STR);
        WfRunVariable user = wf.addVariable(USER_VAR, VariableType.STR);
        wf.assignUserTask(
                USER_TASKS_FORM,
                user,
                group
        ).withNotes("This is a demo form");
    });
    private static final LHConfig config = new LHConfig();
    private static final LittleHorseGrpc.LittleHorseBlockingStub client = config.getBlockingStub();

    public static void main(String[] args) {
        StructDef schema = client.putStructDef(PutStructDefRequest.newBuilder()
                .setName(USER_TASKS_FORM)
                .setStructDef(InlineStructDef.newBuilder()
                        .putFields("quantity", field(VariableType.INT, "How many?"))
                        .putFields("totalCost", field(VariableType.DOUBLE, "How much?"))
                        .putFields("description", field(VariableType.STR, "Describe the request"))
                        .putFields("isApproved", field(VariableType.BOOL, "Is this request acceptable?")
                                .toBuilder().setDefaultValue(VariableValue.newBuilder().setBool(false)).build()))
                .build());
        client.putUserTaskDef(PutUserTaskDefRequest.newBuilder()
                .setName(USER_TASKS_FORM).setResultStructDefId(schema.getId()).build());
        workflow.registerWfSpec(client);
    }

    private static StructFieldDef field(VariableType type, String description) {
        return StructFieldDef.newBuilder()
                .setFieldType(TypeDefinition.newBuilder().setPrimitiveType(type))
                .setDescription(description)
                .build();
    }
}
