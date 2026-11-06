# Struct-backed UserTask API migration

The Business Console now uses proposal 029's Struct-backed task contract. This is
a breaking change to the backend and the shared TypeScript client. Deploy the
backend, API client, and console together. Legacy field-backed definitions are
unsupported and return HTTP 422 when opened or submitted.

## Changed endpoints

All paths below are relative to `/{tenantId}`. Each task endpoint also has an
`/admin` counterpart with the same body and response shape.

| Endpoint                                    | Change                                                                                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /tasks/{wfRunId}/{taskGuid}`           | Removes `fields` and `results`. Adds `resultStructDefId`, `structDefs`, and optional `output`. Admin details also include `TASK_SAVED` events. |
| `POST /tasks/{wfRunId}/{taskGuid}/result`   | Replaces the bare primitive results map with `{ "output": <VariableValue> }`. Returns 204.                                                     |
| `POST /tasks/{wfRunId}/{taskGuid}/progress` | New endpoint. Accepts the same output envelope and replaces the saved draft. Returns 204.                                                      |

The list endpoints still return `SimpleUserTaskRunDTO`. Assignment, claiming,
cancellation, and comment request bodies are unchanged.

## Task details

The new schema and value properties use LittleHorse **protobuf JSON**: camelCase
property names, enum names as strings, decimal strings for int64 values, base64
for bytes, and RFC 3339 timestamp strings. The outer task DTO retains its existing
identity, assignment, status, notes, and scheduled-time properties.

The following is an excerpt of a task detail response:

```json
{
  "id": "task-guid",
  "wfRunId": "workflow-run-id",
  "userTaskDefName": "review-request",
  "status": "ASSIGNED",
  "resultStructDefId": { "name": "review-form", "version": 3 },
  "structDefs": [
    {
      "id": { "name": "review-form", "version": 3 },
      "structDef": {
        "fields": {
          "approved": {
            "fieldType": { "primitiveType": "BOOL" },
            "description": "Approve the request"
          },
          "quantity": { "fieldType": { "primitiveType": "INT" } },
          "note": {
            "fieldType": { "primitiveType": "STR" },
            "isNullable": true
          }
        }
      }
    }
  ],
  "output": {
    "struct": {
      "structDefId": { "name": "review-form", "version": 3 },
      "struct": {
        "fields": {
          "quantity": { "value": { "int": "9007199254740993" } }
        }
      }
    }
  }
}
```

`resultStructDefId` is the exact version pinned to the **run**, even if the
UserTaskDef references an older minimum or a newer StructDef has been published.
`structDefs` contains the root definition followed by all referenced named
definitions, including references inside inline Structs, arrays, and maps. Resolve
references by name and version. Definitions are fetched with the tenant's client;
no cross-tenant schema cache is used.

`output` is absent until a draft or completed output exists. It may be incomplete
while the run is active. A task with no result schema has no `resultStructDefId`
or `output` and has `structDefs: []`.

## Complete a task

Submit this body to either the user or admin `/result` endpoint:

```json
{
  "output": {
    "struct": {
      "struct": {
        "fields": {
          "approved": { "value": { "bool": false } },
          "quantity": { "value": { "int": "9007199254740993" } },
          "note": { "value": {} }
        }
      }
    }
  }
}
```

The root `structDefId` may be omitted. The backend supplies the run's pinned ID;
if an ID is supplied, it must match exactly. Nested values use their own schema
definitions. The root output must be a Struct, not a plain JSON object or a
primitive VariableValue. Only the `output` property is accepted in the envelope;
old `results` maps and client-supplied user IDs or assignment policies are rejected.

For a task without a result schema, send `{}` to complete it.

## Save progress

Send the same envelope to `/progress`. For example, save just `quantity` by
including only that field. To clear a draft, send:

```json
{ "output": { "struct": { "struct": { "fields": {} } } } }
```

Saving **replaces**, rather than merges with, the previous snapshot. Missing
top-level fields are allowed, including required fields. The backend does not
populate defaults; supplied nested Structs still undergo normal validation in
LittleHorse. Completion must submit the full output and applies the kernel's
normal validation and default rules. Saving never advances the workflow.

The authenticated user ID is forwarded to LittleHorse. Non-admin callers must
claim a task before completing or saving it. User saves use
`FAIL_IF_CLAIMED_BY_OTHER`; admin saves use `IGNORE_CLAIM`. Clients cannot choose
that policy. Tasks without a result schema have no progress to save.

For admin details, a saved event has type `TASK_SAVED` and an `event` payload with
`userId` and `output`. Output keeps nested values, Struct IDs, and masking metadata.

## Value semantics

- Omitted field: no entry in `struct.fields`.
- Explicit null: a present field containing `"value": {}`.
- Nullability and omission are distinct. Nullable fields may be null; the kernel
  determines defaults and requiredness on completion.
- `false`, `0`, and `""` are actual values. The backend no longer rejects strings
  merely because they are empty or contain whitespace.
- INT values use decimal **strings** end to end to preserve all 64 bits.
- Arrays carry `items` and optional `elementType`; maps carry typed `entries`
  and `mapType`. Map keys are VariableValues, not necessarily JSON property names.
- Read responses preserve `StructField.masked`. The console hides such values and
  requires an explicit replacement or omission before submitting a draft containing
  them, so a redacted placeholder is never silently resubmitted by the form.

## Errors

| HTTP status | Meaning for submissions                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 400         | Invalid envelope/value representation, wrong root schema ID, kernel validation failure, or progress submitted for a schema-less task |
| 403         | Task access denied, kernel permission denied, or a task already observed as DONE/CANCELLED                                           |
| 404         | Task or associated metadata not found                                                                                                |
| 409         | Kernel `FAILED_PRECONDITION`, including a claim/state change during submission                                                       |
| 422         | Legacy field-backed definition or a struct-backed run without a pinned schema ID                                                     |

Authentication and tenant checks still apply.

## Client and deployment

`completeUserTask(params, request)` now accepts `TaskOutputRequest`, and both
user/admin clients have `saveUserTaskProgress(params, request)`. Detail models
expose `StructDefinition`, `TypeDefinition`, and `TaskVariableValue` types instead
of `UserTaskFieldDTO`, `UserTaskFieldType`, and `UserTaskVariableValue`.

The console renders primitive fields, named and inline Structs, arrays, and maps;
it restores saved output and distinguishes omitted values, null, and defaults.
This is schema-driven form rendering, not a separate form-layout authoring API.

The existing `littlehorseVersion=1.4-SNAPSHOT` dependency must contain proposal
029's generated APIs, including `UserTaskRun.result_struct_def_id`, request/run
`output`, and `UTESaved.output`. The kernel must implement those semantics. The
backend principal also needs permission to read StructDefs in each tenant.
Refresh or publish the appropriate snapshot if building against an older artifact.
The demo workflow now registers a StructDef and references it from its UserTaskDef;
previously created field-backed runs must be replaced with new runs.
