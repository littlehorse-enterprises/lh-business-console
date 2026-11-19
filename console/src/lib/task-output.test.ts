import assert from "node:assert/strict";
import { test } from "node:test";
import {
  emptyValue,
  findStructDefinition,
  validateTaskOutput,
} from "./task-output";
import type {
  InlineStructDefinition,
  StructDefinition,
  TaskVariableValue,
} from "@littlehorse-enterprises/user-tasks-bridge-api-client";

const schema: InlineStructDefinition = {
  fields: {
    quantity: { fieldType: { primitiveType: "INT" } },
    approved: {
      fieldType: { primitiveType: "BOOL" },
      defaultValue: { bool: false },
    },
    note: { fieldType: { primitiveType: "STR" }, isNullable: true },
    address: {
      fieldType: {
        inlineStructDef: {
          fields: { city: { fieldType: { primitiveType: "STR" } } },
        },
      },
      isNullable: true,
    },
  },
};

test("saving omits required top-level fields and does not populate defaults", () => {
  const output = emptyValue({ structDefId: { name: "form", version: 3 } });
  assert.deepEqual(validateTaskOutput(output, schema, [], true), []);
  assert.deepEqual(output.struct?.struct?.fields, {});
  assert.deepEqual(validateTaskOutput(output, schema, [], false), [
    "quantity: a value is required.",
  ]);
});

test("nested structs must be complete even when saving a draft", () => {
  const output = {
    struct: { struct: { fields: { address: { value: { struct: {} } } } } },
  };
  assert.deepEqual(validateTaskOutput(output, schema, [], true), [
    "address.city: a value is required.",
  ]);
});

test("null is distinct from omission and false, zero and empty strings survive", () => {
  const output: TaskVariableValue = {
    struct: {
      struct: {
        fields: {
          quantity: { value: { int: "0" } },
          approved: { value: { bool: false } },
          note: { value: {} },
          address: {
            value: {
              struct: { struct: { fields: { city: { value: { str: "" } } } } },
            },
          },
        },
      },
    },
  };
  assert.deepEqual(validateTaskOutput(output, schema, [], false), []);
  assert.deepEqual(JSON.parse(JSON.stringify(output)), output);
  output.struct!.struct!.fields!.quantity = { value: {} };
  assert.deepEqual(validateTaskOutput(output, schema, [], false), [
    "quantity: cannot be null.",
  ]);
});

test("int64 limits are validated without rounding to JavaScript numbers", () => {
  const output = (int: string) => ({
    struct: { struct: { fields: { quantity: { value: { int } } } } },
  });
  for (const int of [
    "9223372036854775807",
    "-9223372036854775808",
    "9007199254740993",
  ]) {
    assert.deepEqual(validateTaskOutput(output(int), schema, [], false), []);
    assert.equal(
      JSON.parse(JSON.stringify(output(int))).struct.struct.fields.quantity
        .value.int,
      int,
    );
  }
  for (const int of [
    "9223372036854775808",
    "-9223372036854775809",
    "1.2",
    "",
    "1e3",
  ]) {
    assert.equal(validateTaskOutput(output(int), schema, [], false).length, 1);
  }
});

test("resolve exact versions even when newer definitions are present", () => {
  const definitions: StructDefinition[] = [
    { id: { name: "form", version: 3 }, structDef: schema },
    { id: { name: "form", version: 4 }, structDef: { fields: {} } },
  ];
  assert.equal(
    findStructDefinition({ name: "form", version: 3 }, definitions),
    schema,
  );
  assert.throws(() =>
    findStructDefinition({ name: "form", version: 2 }, definitions),
  );
});

test("empty collections retain their type metadata", () => {
  const arrayType = { primitiveType: "INT" } as const;
  const mapType = {
    keyType: { primitiveType: "INT" },
    valueType: { primitiveType: "STR" },
  } as const;
  assert.deepEqual(emptyValue({ inlineArrayDef: { arrayType } }), {
    array: { items: [], elementType: arrayType },
  });
  assert.deepEqual(emptyValue({ inlineMapDef: mapType }), {
    map: { entries: [], mapType },
  });
});

test("masked values cannot be resubmitted as redacted placeholders", () => {
  const output = {
    struct: {
      struct: { fields: { note: { masked: true, value: { str: "hidden" } } } },
    },
  };
  assert.deepEqual(validateTaskOutput(output, schema, [], true), [
    "note: replace or omit the hidden value before submitting.",
  ]);
});

test("validate array and map contents recursively", () => {
  const nested: InlineStructDefinition = {
    fields: {
      counts: {
        fieldType: { inlineArrayDef: { arrayType: { primitiveType: "INT" } } },
      },
      amounts: {
        fieldType: {
          inlineMapDef: {
            keyType: { primitiveType: "STR" },
            valueType: { primitiveType: "INT" },
          },
        },
      },
    },
  };
  const output: TaskVariableValue = {
    struct: {
      struct: {
        fields: {
          counts: { value: { array: { items: [{ int: "1.2" }] } } },
          amounts: {
            value: {
              map: { entries: [{ key: { str: "a" }, value: { int: "no" } }] },
            },
          },
        },
      },
    },
  };
  assert.deepEqual(validateTaskOutput(output, nested, [], true), [
    "counts[1]: enter a signed 64-bit integer.",
    "amounts[1].value: enter a signed 64-bit integer.",
  ]);
});

test("decimal input remains editable and accepts protobuf special values", () => {
  const schema: InlineStructDefinition = {
    fields: { amount: { fieldType: { primitiveType: "DOUBLE" } } },
  };
  const output = (double: string) => ({
    struct: { struct: { fields: { amount: { value: { double } } } } },
  });
  for (const value of ["0", "-1.25", "1e3", "NaN", "Infinity", "-Infinity"]) {
    assert.deepEqual(validateTaskOutput(output(value), schema, [], false), []);
  }
  for (const value of ["", "-", "hello", "0x10", "1e999"]) {
    assert.deepEqual(validateTaskOutput(output(value), schema, [], false), [
      "amount: enter a number.",
    ]);
  }
});
