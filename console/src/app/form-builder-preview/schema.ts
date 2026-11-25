import { validateTaskOutput } from "@/lib/task-output";
import type {
  InlineStructDefinition,
  TaskVariableValue,
} from "@littlehorse-enterprises/user-tasks-bridge-api-client";

export const fieldTypes = {
  STR: "Text",
  INT: "Whole number",
  DOUBLE: "Decimal number",
  BOOL: "Yes / No",
  TIMESTAMP: "Date and time",
} as const;

export type Field = {
  id: string;
  key: string;
  label: string;
  help: string;
  type: keyof typeof fieldTypes;
  required: boolean;
  defaultValue?: string;
};

export const library: { name: string; version: number; fields: Field[] }[] = [
  {
    name: "purchase-review",
    version: 2,
    fields: [
      {
        id: "request",
        key: "request_id",
        label: "Request ID",
        type: "STR",
        required: true,
        help: "Use the request number from the purchase order.",
      },
      {
        id: "decision",
        key: "approved",
        label: "Approve this purchase?",
        type: "BOOL",
        required: true,
        help: "",
      },
      {
        id: "amount",
        key: "approved_amount",
        label: "Approved amount (USD)",
        type: "DOUBLE",
        required: false,
        help: "",
        defaultValue: "0",
      },
      {
        id: "notes",
        key: "review_notes",
        label: "Reviewer notes",
        type: "STR",
        required: false,
        help: "",
      },
    ],
  },
  {
    name: "inventory-check",
    version: 1,
    fields: [
      {
        id: "sku",
        key: "sku",
        label: "Item SKU",
        type: "STR",
        required: true,
        help: "",
      },
      {
        id: "count",
        key: "counted_units",
        label: "Units counted",
        type: "INT",
        required: true,
        help: "",
      },
      {
        id: "counted",
        key: "counted_at",
        label: "Counted at",
        type: "TIMESTAMP",
        required: false,
        help: "",
      },
    ],
  },
];

function encode(type: Field["type"], value: string): TaskVariableValue {
  switch (type) {
    case "STR":
      return { str: value };
    case "INT":
      return { int: value };
    case "DOUBLE":
      return { double: value };
    case "BOOL":
      return { bool: value === "true" };
    case "TIMESTAMP":
      return { utcTimestamp: value };
  }
}

function makeSchema(fields: Field[]): InlineStructDefinition {
  return {
    fields: Object.fromEntries(
      fields.map((field) => [
        field.id,
        {
          fieldType: { primitiveType: field.type },
          isNullable: !field.required,
          description: field.help,
          defaultValue:
            field.defaultValue === undefined
              ? undefined
              : encode(field.type, field.defaultValue),
        },
      ]),
    ),
  };
}

export function validateAnswers(
  fields: Field[],
  answers: Record<string, string>,
) {
  const output = {
    struct: {
      struct: {
        fields: Object.fromEntries(
          fields.flatMap((field) => {
            const value = answers[field.id] ?? field.defaultValue;
            return value === undefined
              ? []
              : [[field.id, { value: encode(field.type, value) }]];
          }),
        ),
      },
    },
  };
  return Object.fromEntries(
    validateTaskOutput(output, makeSchema(fields), [], false).map((error) => {
      const delimiter = error.indexOf(":");
      return [error.slice(0, delimiter), error.slice(delimiter + 2)];
    }),
  );
}

export function defaultError(field: Field) {
  if (field.defaultValue === undefined) return undefined;
  return validateAnswers([field], { [field.id]: field.defaultValue })[field.id];
}
