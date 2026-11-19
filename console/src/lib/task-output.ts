import type {
  InlineStructDefinition,
  StructDefinition,
  StructDefId,
  TaskVariableValue,
  TypeDefinition,
} from "@littlehorse-enterprises/user-tasks-bridge-api-client";

export function findStructDefinition(
  id: StructDefId,
  definitions: StructDefinition[],
) {
  const definition = definitions.find(
    (candidate) =>
      candidate.id.name === id.name && candidate.id.version === id.version,
  );
  if (!definition)
    throw new Error(
      `The schema ${id.name} version ${id.version} is unavailable.`,
    );
  return definition.structDef ?? {};
}

export function emptyValue(type: TypeDefinition): TaskVariableValue {
  if (type.structDefId)
    return {
      struct: { structDefId: type.structDefId, struct: { fields: {} } },
    };
  if (type.inlineStructDef) return { struct: { struct: { fields: {} } } };
  if (type.inlineArrayDef)
    return { array: { items: [], elementType: type.inlineArrayDef.arrayType } };
  if (type.inlineMapDef)
    return { map: { entries: [], mapType: type.inlineMapDef } };
  switch (type.primitiveType) {
    case "STR":
      return { str: "" };
    case "BOOL":
      return { bool: false };
    case "INT":
      return { int: "0" };
    case "DOUBLE":
      return { double: 0 };
    case "JSON_OBJ":
      return { jsonObj: "{}" };
    case "JSON_ARR":
      return { jsonArr: "[]" };
    case "BYTES":
      return { bytes: "" };
    case "WF_RUN_ID":
      return { wfRunId: { id: "" } };
    case "TIMESTAMP":
      return { utcTimestamp: "" };
    default:
      throw new Error("This field has an unsupported type.");
  }
}

/** Validate input representation; the kernel remains authoritative for schema validation. */
export function validateTaskOutput(
  output: TaskVariableValue,
  schema: InlineStructDefinition,
  definitions: StructDefinition[],
  saving: boolean,
): string[] {
  const errors: string[] = [];
  const visitStruct = (
    value: TaskVariableValue,
    definition: InlineStructDefinition,
    path: string,
    partial: boolean,
  ) => {
    const fields = value.struct?.struct?.fields ?? {};
    for (const [name, field] of Object.entries(definition.fields ?? {})) {
      const fieldPath = path ? `${path}.${name}` : name;
      const entered = fields[name];
      if (!entered) {
        if (!partial && field.defaultValue === undefined && !field.isNullable)
          errors.push(`${fieldPath}: a value is required.`);
        continue;
      }
      if (entered.masked) {
        errors.push(
          `${fieldPath}: replace or omit the hidden value before submitting.`,
        );
        continue;
      }
      const current = entered.value ?? {};
      if (Object.keys(current).length === 0) {
        if (!field.isNullable) errors.push(`${fieldPath}: cannot be null.`);
      } else visit(current, field.fieldType, fieldPath);
    }
  };
  const visit = (
    value: TaskVariableValue,
    type: TypeDefinition,
    path: string,
  ) => {
    if (type.structDefId || type.inlineStructDef) {
      const definition =
        type.inlineStructDef ??
        findStructDefinition(type.structDefId!, definitions);
      visitStruct(value, definition, path, false);
    } else if (type.inlineArrayDef) {
      value.array?.items?.forEach((item, i) =>
        visit(item, type.inlineArrayDef!.arrayType, `${path}[${i + 1}]`),
      );
    } else if (type.inlineMapDef) {
      value.map?.entries?.forEach((entry, i) => {
        visit(entry.key, type.inlineMapDef!.keyType, `${path}[${i + 1}].key`);
        visit(
          entry.value,
          type.inlineMapDef!.valueType,
          `${path}[${i + 1}].value`,
        );
      });
    } else if (type.primitiveType === "INT") {
      const integer = value.int ?? "";
      if (
        !/^-?\d+$/.test(integer) ||
        BigInt(integer) < BigInt("-9223372036854775808") ||
        BigInt(integer) > BigInt("9223372036854775807")
      ) {
        errors.push(`${path}: enter a signed 64-bit integer.`);
      }
    } else if (type.primitiveType === "DOUBLE") {
      const number = String(value.double ?? "");
      if (
        !["NaN", "Infinity", "-Infinity"].includes(number) &&
        (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(number) ||
          !Number.isFinite(Number(number)))
      ) {
        errors.push(`${path}: enter a number.`);
      }
    } else if (
      type.primitiveType === "TIMESTAMP" &&
      (!value.utcTimestamp ||
        !/^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(value.utcTimestamp) ||
        Number.isNaN(Date.parse(value.utcTimestamp)))
    ) {
      errors.push(`${path}: enter a timestamp including its time zone.`);
    } else if (
      type.primitiveType === "JSON_OBJ" ||
      type.primitiveType === "JSON_ARR"
    ) {
      try {
        const parsed: unknown = JSON.parse(
          value.jsonObj ?? value.jsonArr ?? "",
        );
        const valid =
          type.primitiveType === "JSON_ARR"
            ? Array.isArray(parsed)
            : parsed !== null &&
              typeof parsed === "object" &&
              !Array.isArray(parsed);
        if (!valid) throw new Error();
      } catch {
        errors.push(
          `${path}: enter a valid JSON ${type.primitiveType === "JSON_ARR" ? "array" : "object"}.`,
        );
      }
    }
  };
  try {
    visitStruct(output, schema, "", saving);
  } catch (error) {
    errors.push(
      error instanceof Error
        ? error.message
        : "Unable to resolve the form schema.",
    );
  }
  return errors;
}
