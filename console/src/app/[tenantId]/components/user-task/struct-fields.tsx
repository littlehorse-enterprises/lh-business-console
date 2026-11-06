"use client";

import { Button } from "@littlehorse-enterprises/ui-library/button";
import { Input } from "@littlehorse-enterprises/ui-library/input";
import { emptyValue, findStructDefinition } from "@/lib/task-output";
import type {
  InlineStructDefinition,
  StructDefinition,
  StructFieldValue,
  TaskVariableValue,
  TypeDefinition,
  WorkflowRunId,
} from "@littlehorse-enterprises/user-tasks-bridge-api-client";

interface ValueProps {
  type: TypeDefinition;
  value: TaskVariableValue;
  definitions: StructDefinition[];
  readOnly: boolean;
  path: string;
  onChange: (value: TaskVariableValue) => void;
}

export function StructFields({
  schema,
  fields,
  definitions,
  readOnly,
  onChange,
  path = "form",
}: {
  schema: InlineStructDefinition;
  fields: Record<string, StructFieldValue>;
  definitions: StructDefinition[];
  readOnly: boolean;
  onChange: (fields: Record<string, StructFieldValue>) => void;
  path?: string;
}) {
  return (
    <div className="space-y-4">
      {Object.entries(schema.fields ?? {}).map(([name, field]) => {
        const current = fields[name];
        const mode = !current
          ? "omitted"
          : !current.masked && Object.keys(current.value ?? {}).length === 0
            ? "null"
            : "value";
        const required = field.defaultValue === undefined && !field.isNullable;
        const update = (value?: StructFieldValue) => {
          const next = { ...fields };
          if (value === undefined) delete next[name];
          else next[name] = value;
          onChange(next);
        };
        const id = `${path}.${name}`;
        return (
          <fieldset key={name} className="space-y-2 rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">
              {name}
              {required ? " *" : ""}
            </legend>
            {field.description && (
              <p className="text-sm text-muted-foreground">
                {field.description}
              </p>
            )}
            {readOnly && current?.masked ? (
              <p>Hidden value</p>
            ) : (
              <>
                {!readOnly && (
                  <select
                    aria-label={`${name} value mode`}
                    className="w-full rounded-md border bg-background p-2 text-sm"
                    value={mode}
                    onChange={(event) => {
                      const selected = event.target.value;
                      update(
                        selected === "omitted"
                          ? undefined
                          : {
                              value:
                                selected === "null"
                                  ? {}
                                  : emptyValue(field.fieldType),
                            },
                      );
                    }}
                  >
                    <option value="omitted">
                      {field.defaultValue !== undefined
                        ? "Use default when completing"
                        : "Not provided"}
                    </option>
                    <option value="value">Enter a value</option>
                    {field.isNullable && <option value="null">Null</option>}
                  </select>
                )}
                {current?.masked && (
                  <p className="text-sm text-muted-foreground">
                    This saved value is hidden. Enter a replacement before
                    saving or completing.
                  </p>
                )}
                {mode === "value" && (
                  <ValueEditor
                    type={field.fieldType}
                    value={
                      current?.masked
                        ? emptyValue(field.fieldType)
                        : (current?.value ?? {})
                    }
                    definitions={definitions}
                    readOnly={readOnly}
                    path={id}
                    onChange={(value) => update({ value })}
                  />
                )}
                {readOnly && mode !== "value" && (
                  <p className="text-sm text-muted-foreground">
                    {mode === "null" ? "Null" : "Not provided"}
                  </p>
                )}
              </>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

function ValueEditor({
  type,
  value,
  definitions,
  readOnly,
  path,
  onChange,
}: ValueProps) {
  if (type.structDefId || type.inlineStructDef) {
    let schema: InlineStructDefinition;
    try {
      schema =
        type.inlineStructDef ??
        findStructDefinition(type.structDefId!, definitions);
    } catch (error) {
      return (
        <p role="alert">
          {error instanceof Error ? error.message : "Schema unavailable"}
        </p>
      );
    }
    return (
      <StructFields
        schema={schema}
        fields={value.struct?.struct?.fields ?? {}}
        definitions={definitions}
        readOnly={readOnly}
        path={path}
        onChange={(fields) =>
          onChange({
            struct: {
              ...value.struct,
              struct: { fields },
              ...(type.structDefId ? { structDefId: type.structDefId } : {}),
            },
          })
        }
      />
    );
  }
  if (type.inlineArrayDef) {
    const elementType = type.inlineArrayDef.arrayType;
    const items = value.array?.items ?? [];
    const update = (next: TaskVariableValue[]) =>
      onChange({ array: { items: next, elementType } });
    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="space-y-2 border-l pl-3">
            <p className="text-sm">Item {index + 1}</p>
            <ValueEditor
              type={elementType}
              value={item}
              definitions={definitions}
              readOnly={readOnly}
              path={`${path}[${index}]`}
              onChange={(next) =>
                update(
                  items.map((previous, i) => (i === index ? next : previous)),
                )
              }
            />
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={() => update(items.filter((_, i) => i !== index))}
              >
                Remove item {index + 1}
              </Button>
            )}
          </div>
        ))}
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            onClick={() => update([...items, emptyValue(elementType)])}
          >
            Add item
          </Button>
        )}
      </div>
    );
  }
  if (type.inlineMapDef) {
    const mapType = type.inlineMapDef;
    const entries = value.map?.entries ?? [];
    const update = (next: typeof entries) =>
      onChange({ map: { entries: next, mapType } });
    return (
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={index} className="space-y-2 border-l pl-3">
            <p className="text-sm">Key {index + 1}</p>
            <ValueEditor
              type={mapType.keyType}
              value={entry.key}
              definitions={definitions}
              readOnly={readOnly}
              path={`${path}[${index}].key`}
              onChange={(key) =>
                update(
                  entries.map((previous, i) =>
                    i === index ? { ...entry, key } : previous,
                  ),
                )
              }
            />
            <p className="text-sm">Value {index + 1}</p>
            <ValueEditor
              type={mapType.valueType}
              value={entry.value}
              definitions={definitions}
              readOnly={readOnly}
              path={`${path}[${index}].value`}
              onChange={(next) =>
                update(
                  entries.map((previous, i) =>
                    i === index ? { ...entry, value: next } : previous,
                  ),
                )
              }
            />
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={() => update(entries.filter((_, i) => i !== index))}
              >
                Remove entry {index + 1}
              </Button>
            )}
          </div>
        ))}
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              update([
                ...entries,
                {
                  key: emptyValue(mapType.keyType),
                  value: emptyValue(mapType.valueType),
                },
              ])
            }
          >
            Add entry
          </Button>
        )}
      </div>
    );
  }
  if (type.primitiveType === "BOOL")
    return (
      <select
        aria-label={path}
        className="w-full rounded-md border bg-background p-2"
        disabled={readOnly}
        value={String(value.bool ?? false)}
        onChange={(event) => onChange({ bool: event.target.value === "true" })}
      >
        <option value="false">False</option>
        <option value="true">True</option>
      </select>
    );
  if (type.primitiveType === "JSON_OBJ" || type.primitiveType === "JSON_ARR") {
    const key = type.primitiveType === "JSON_OBJ" ? "jsonObj" : "jsonArr";
    return (
      <textarea
        aria-label={path}
        className="w-full rounded-md border bg-background p-2 font-mono"
        rows={4}
        readOnly={readOnly}
        value={value[key] ?? ""}
        onChange={(event) => onChange({ [key]: event.target.value })}
      />
    );
  }
  switch (type.primitiveType) {
    case "STR":
      return (
        <Input
          aria-label={path}
          readOnly={readOnly}
          type={type.masked && !readOnly ? "password" : "text"}
          value={value.str ?? ""}
          onChange={(event) => onChange({ str: event.target.value })}
        />
      );
    case "INT":
      return (
        <Input
          aria-label={path}
          readOnly={readOnly}
          inputMode="numeric"
          value={value.int ?? ""}
          onChange={(event) => onChange({ int: event.target.value })}
        />
      );
    case "DOUBLE":
      return (
        <Input
          aria-label={path}
          readOnly={readOnly}
          inputMode="decimal"
          value={value.double ?? ""}
          onChange={(event) => onChange({ double: event.target.value })}
        />
      );
    case "BYTES":
      return (
        <Input
          aria-label={path}
          readOnly={readOnly}
          placeholder="Base64-encoded content"
          value={value.bytes ?? ""}
          onChange={(event) => onChange({ bytes: event.target.value })}
        />
      );
    case "WF_RUN_ID":
      return (
        <WorkflowRunIdFields
          value={value.wfRunId ?? { id: "" }}
          readOnly={readOnly}
          path={path}
          onChange={(wfRunId) => onChange({ wfRunId })}
        />
      );
    case "TIMESTAMP":
      return (
        <Input
          aria-label={path}
          readOnly={readOnly}
          placeholder="2026-11-06T12:00:00Z"
          value={value.utcTimestamp ?? ""}
          onChange={(event) => onChange({ utcTimestamp: event.target.value })}
        />
      );
    default:
      return <p role="alert">Unsupported field type.</p>;
  }
}

function WorkflowRunIdFields({
  value,
  readOnly,
  path,
  onChange,
}: {
  value: WorkflowRunId;
  readOnly: boolean;
  path: string;
  onChange: (value: WorkflowRunId) => void;
}) {
  return (
    <div className="space-y-2">
      <Input
        aria-label={path}
        readOnly={readOnly}
        value={value.id}
        onChange={(event) => onChange({ ...value, id: event.target.value })}
      />
      {value.parentWfRunId ? (
        <fieldset className="border-l pl-3 space-y-2">
          <legend className="text-sm">Parent workflow run</legend>
          <WorkflowRunIdFields
            value={value.parentWfRunId}
            readOnly={readOnly}
            path={`${path}.parent`}
            onChange={(parentWfRunId) => onChange({ ...value, parentWfRunId })}
          />
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onChange({ id: value.id })}
            >
              Remove parent
            </Button>
          )}
        </fieldset>
      ) : (
        !readOnly && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange({ ...value, parentWfRunId: { id: "" } })}
          >
            Add parent workflow run
          </Button>
        )
      )}
    </div>
  );
}
