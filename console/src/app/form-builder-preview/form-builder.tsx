"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@littlehorse-enterprises/ui-library/button";
import { Input } from "@littlehorse-enterprises/ui-library/input";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  Database,
  Eye,
  FileText,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  defaultError,
  fieldTypes,
  library,
  validateAnswers,
  type Field,
} from "./schema";

const panel = "min-w-0 rounded-xl border border-border bg-card p-4 sm:p-6";
const control =
  "w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring";
const labelClass = "block space-y-1.5 text-sm font-medium";
const hint = "text-sm text-muted-foreground";
const taskSeed = "review-purchase-request";

function AnswerInput({
  id,
  type,
  value,
  onChange,
  invalid,
  describedBy,
  required,
}: {
  id: string;
  type: Field["type"];
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  required?: boolean;
}) {
  if (type === "BOOL") {
    return (
      <select
        id={id}
        className={control}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        aria-required={required}
      >
        <option value="">Select an answer</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }
  return (
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode={
        type === "INT" ? "numeric" : type === "DOUBLE" ? "decimal" : undefined
      }
      placeholder={type === "TIMESTAMP" ? "2026-11-23T14:30:00Z" : undefined}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      aria-required={required}
    />
  );
}

function FieldEditor({
  field,
  onChange,
  onRemove,
}: {
  field: Field;
  onChange: (field: Field) => void;
  onRemove: () => void;
}) {
  const error = defaultError(field);
  return (
    <div className="space-y-4 border-t border-border bg-muted/25 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Field label
          <Input
            id={"label-" + field.id}
            value={field.label}
            onChange={(e) => onChange({ ...field, label: e.target.value })}
          />
        </label>

        <label className={labelClass}>
          Field type
          <select
            className={control}
            value={field.type}
            onChange={(e) =>
              onChange({
                ...field,
                type: e.target.value as Field["type"],
                defaultValue: undefined,
              })
            }
          >
            {Object.entries(fieldTypes).map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Help text <span className={hint}>(optional)</span>
          <Input
            value={field.help}
            onChange={(e) => onChange({ ...field, help: e.target.value })}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={field.required}
          onChange={(e) => onChange({ ...field, required: e.target.checked })}
        />
        Answer required
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={field.defaultValue !== undefined}
          onChange={(e) =>
            onChange({
              ...field,
              defaultValue: e.target.checked
                ? field.type === "BOOL"
                  ? "false"
                  : ""
                : undefined,
            })
          }
        />
        Set a default
      </label>
      {field.defaultValue !== undefined && (
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="field-default">
            Default value
          </label>
          <AnswerInput
            id="field-default"
            type={field.type}
            value={field.defaultValue}
            onChange={(value) =>
              onChange({
                ...field,
                defaultValue:
                  field.type === "BOOL" && !value ? undefined : value,
              })
            }
            invalid={!!error}
            describedBy={error ? "field-default-error" : "field-default-help"}
          />
          {error ? (
            <p id="field-default-error" className="text-sm text-destructive">
              {error}
            </p>
          ) : (
            <p id="field-default-help" className={hint}>
              Applied when the assignee leaves the answer blank.
            </p>
          )}
        </div>
      )}
      <details className="rounded-md border border-border p-3 text-sm">
        <summary className="cursor-pointer font-medium">
          Workflow settings
        </summary>
        <p className={hint + " my-2"}>
          The workflow uses this key to read the answer.
        </p>
        <label className={labelClass}>
          Field key
          <Input
            value={field.key}
            onChange={(e) => onChange({ ...field, key: e.target.value })}
          />
        </label>
      </details>
      <Button type="button" size="sm" variant="outline" onClick={onRemove}>
        <Trash2 className="size-4" /> Remove field
      </Button>
    </div>
  );
}

function FormPreview({
  fields,
  name,
  description,
}: {
  fields: Field[];
  name: string;
  description: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  return (
    <section
      id="assignee-preview"
      tabIndex={-1}
      aria-labelledby="preview-title"
      className={panel + " shadow-sm"}
    >
      <h2
        id="preview-title"
        className="-mx-4 -mt-4 mb-5 flex items-center gap-2 rounded-t-xl border-b border-border bg-muted px-4 py-3 text-sm font-semibold sm:-mx-6 sm:-mt-6 sm:px-6"
      >
        <Eye className="size-4" aria-hidden /> Assignee preview
      </h2>
      <h3 className="text-xl font-semibold break-words">
        {name.trim() || "Untitled task"}
      </h3>
      {description.trim() && (
        <p className={hint + " mt-1 break-words"}>{description}</p>
      )}
      {fields.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Add a field to try the form.
        </p>
      ) : (
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const results = validateAnswers(fields, answers);
            setErrors(results);
            setChecked(true);
            setSubmitted(!Object.keys(results).length);
            const firstError = fields.find((field) => results[field.id]);
            if (firstError)
              document.getElementById("answer-" + firstError.id)?.focus();
          }}
        >
          {fields.map((field) => {
            const id = "answer-" + field.id;
            const error = checked ? errors[field.id] : undefined;
            const fallback = field.defaultValue;
            const displayDefault =
              field.type === "BOOL"
                ? fallback === "true"
                  ? "Yes"
                  : "No"
                : fallback || "Empty text";
            const help = [
              field.help,
              fallback === undefined
                ? ""
                : "Default if blank · " + displayDefault,
              field.type === "TIMESTAMP" ? "Include a time zone." : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <div key={field.id} className="space-y-1.5">
                <label className={labelClass + " break-words"} htmlFor={id}>
                  {field.label.trim() || "Untitled field"}
                  {field.required && fallback === undefined && (
                    <span className="ml-1 text-destructive"> *</span>
                  )}
                </label>
                <AnswerInput
                  id={id}
                  value={answers[field.id] ?? ""}
                  type={field.type}
                  required={field.required && fallback === undefined}
                  invalid={!!error}
                  describedBy={
                    error ? id + "-error" : help ? id + "-help" : undefined
                  }
                  onChange={(value) => {
                    const next = { ...answers };
                    if (value === "") delete next[field.id];
                    else next[field.id] = value;
                    setAnswers(next);
                    setSubmitted(false);
                    if (checked) setErrors(validateAnswers(fields, next));
                  }}
                />
                {help && (
                  <p className={hint + " break-words"} id={id + "-help"}>
                    {help}
                  </p>
                )}
                {error && (
                  <p id={id + "-error"} className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button type="submit" variant="outline">
              Test submission
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setAnswers({});
                setErrors({});
                setChecked(false);
                setSubmitted(false);
              }}
            >
              Reset answers
            </Button>
          </div>
          <div aria-live="polite">
            {submitted && (
              <p className="text-sm font-medium text-success-strong">
                Test passed. Answers were validated locally.
              </p>
            )}
            {checked && Object.keys(errors).length > 0 && (
              <p className="text-sm text-destructive">
                Check the highlighted answers and try again.
              </p>
            )}
          </div>
        </form>
      )}
    </section>
  );
}

export function FormBuilder() {
  const [taskName, setTaskName] = useState(taskSeed);
  const [description, setDescription] = useState(
    "Check the request and record your purchasing decision.",
  );
  const [schemaName, setSchemaName] = useState("purchase-review-draft");
  const [schemaMode, setSchemaMode] = useState("new");
  const [schemaIndex, setSchemaIndex] = useState(0);
  const [draft, setDraft] = useState(library[0].fields);
  const [selected, setSelected] = useState<string>();
  const [stage, setStage] = useState<"design" | "review" | "published">(
    "design",
  );
  const [issues, setIssues] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const issueList = useRef<HTMLDivElement>(null);
  const newSchema = schemaMode === "new";
  const reusedSchema = library[schemaIndex];
  const fields = newSchema ? draft : reusedSchema.fields;
  const resolvedName = newSchema ? schemaName.trim() : reusedSchema.name;
  const previewKey = JSON.stringify([schemaMode, resolvedName, fields]);

  function changeStage(next: typeof stage) {
    setStage(next);
    requestAnimationFrame(() => heading.current?.focus());
  }

  function updateFields(next: Field[]) {
    setDraft(next);
    setIssues([]);
  }

  function addField() {
    const id = crypto.randomUUID();
    updateFields([
      ...draft,
      { id, key: "", label: "", help: "", type: "STR", required: false },
    ]);
    setSelected(id);
    setNotice("Field added.");
    requestAnimationFrame(() =>
      document.getElementById("label-" + id)?.focus(),
    );
  }

  function moveField(index: number, destination: number) {
    const next = [...draft];
    const [field] = next.splice(index, 1);
    next.splice(destination, 0, field);
    updateFields(next);
    setNotice(
      (field.label || "Field") +
        " moved to position " +
        (destination + 1) +
        ".",
    );
    requestAnimationFrame(() =>
      document.getElementById("edit-" + field.id)?.focus(),
    );
  }

  function review() {
    const messages: string[] = [];
    const definitionName = /^[a-z][a-z0-9-]*$/;
    if (!definitionName.test(taskName.trim()))
      messages.push(
        "Enter a task definition name using lowercase letters, numbers, and hyphens.",
      );
    if (newSchema) {
      if (!definitionName.test(resolvedName))
        messages.push(
          "Enter a schema name using lowercase letters, numbers, and hyphens.",
        );
      if (library.some(({ name }) => name === resolvedName))
        messages.push(
          "That schema name already exists in the sample library. Choose a new name or reuse it.",
        );
      if (!fields.length) messages.push("Add at least one field.");
      const keys = new Set<string>();
      fields.forEach((field, index) => {
        const title = field.label.trim() || "Field " + (index + 1);
        const key = field.key.trim();
        if (!field.label.trim()) messages.push(title + " needs a label.");
        if (!/^[a-z][a-z0-9_]*$/.test(key))
          messages.push(
            title +
              " needs a field key using lowercase letters, numbers, and underscores.",
          );
        if (key && keys.has(key))
          messages.push(title + " repeats the field key " + key + ".");
        keys.add(key);
        const error = defaultError(field);
        if (error) messages.push(title + " default: " + error);
      });
    }
    setIssues(messages);
    if (messages.length)
      requestAnimationFrame(() => issueList.current?.focus());
    else changeStage("review");
  }

  return (
    <div className="min-h-dvh bg-muted/25 font-sans text-foreground">
      <a
        href="#builder-main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-3"
      >
        Skip to content
      </a>
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.svg"
              width={36}
              height={36}
              alt=""
              className="dark:hidden"
            />
            <img
              src="/images/logo-white.svg"
              width={36}
              height={36}
              alt=""
              className="hidden dark:block"
            />
            <div>
              <p className="font-bold leading-tight">LittleHorse</p>
              <p className="text-xs text-muted-foreground">Business Console</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium">
              Local prototype
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main
        id="builder-main"
        className="mx-auto max-w-7xl space-y-5 px-4 py-5 md:px-8 md:py-7"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="size-4" aria-hidden /> Forms{" "}
          <ChevronRight className="size-3" aria-hidden />{" "}
          <span>Definition builder</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1
              ref={heading}
              tabIndex={-1}
              className="text-2xl font-bold tracking-tight outline-none sm:text-3xl"
            >
              {stage === "design"
                ? "User Task Form Builder"
                : stage === "review"
                  ? "Review form"
                  : "Simulation complete"}
            </h1>
            <p className={hint + " mt-1"}>
              {stage === "design"
                ? "Choose the questions people answer when they complete this task."
                : "Review and publishing use sample data and reset on reload."}
            </p>
          </div>
          {stage === "design" && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="lg:hidden" asChild>
                <a href="#assignee-preview">Try preview</a>
              </Button>
              <Button onClick={review}>
                Review form <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
        {stage === "design" ? (
          <>
            {issues.length > 0 && (
              <div
                ref={issueList}
                tabIndex={-1}
                role="alert"
                className="rounded-lg border border-destructive bg-card p-4 text-sm"
              >
                <p className="font-semibold text-destructive">
                  Fix these items before review
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {issues.map((message, i) => (
                    <li key={i}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start">
              <div className="space-y-5">
                <section
                  aria-labelledby="details-title"
                  className={panel + " space-y-4"}
                >
                  <h2
                    id="details-title"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <FileText className="size-5" aria-hidden /> Task details
                  </h2>
                  <label className={labelClass}>
                    Task name
                    <Input
                      value={taskName}
                      onChange={(e) => {
                        setTaskName(e.target.value);
                        setIssues([]);
                      }}
                    />
                  </label>
                  <label className={labelClass}>
                    Description <span className={hint}>(optional)</span>
                    <textarea
                      className={control}
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </label>
                </section>
                <section
                  aria-labelledby="schema-title"
                  className={panel + " space-y-4"}
                >
                  <h2
                    id="schema-title"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <Database className="size-5" aria-hidden /> Field source
                  </h2>
                  <fieldset className="grid gap-2 sm:grid-cols-2">
                    <legend className="sr-only">Schema source</legend>
                    {[
                      ["new", "Create my own fields"],
                      ["reuse", "Use existing fields"],
                    ].map(([value, title]) => (
                      <label
                        key={value}
                        className={
                          "flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-medium " +
                          (schemaMode === value
                            ? "border-primary bg-primary/10"
                            : "border-border")
                        }
                      >
                        <input
                          className="size-4 accent-primary"
                          type="radio"
                          name="schema-source"
                          value={value}
                          checked={schemaMode === value}
                          onChange={() => {
                            setSchemaMode(value);
                            setIssues([]);
                          }}
                        />
                        {title}
                      </label>
                    ))}
                  </fieldset>
                  {newSchema ? (
                    <label className={labelClass}>
                      Field set name
                      <Input
                        value={schemaName}
                        onChange={(e) => {
                          setSchemaName(e.target.value);
                          setIssues([]);
                        }}
                      />
                    </label>
                  ) : (
                    <>
                      <label className={labelClass}>
                        Saved field set
                        <select
                          className={control}
                          value={schemaIndex}
                          onChange={(e) =>
                            setSchemaIndex(Number(e.target.value))
                          }
                        >
                          {library.map((schema, index) => (
                            <option value={index} key={schema.name}>
                              {schema.name} · v{schema.version}
                            </option>
                          ))}
                        </select>
                      </label>
                      <p className={hint}>
                        This task references the selected schema. Its fields are
                        read-only here.
                      </p>
                    </>
                  )}
                </section>
                <section
                  aria-labelledby="fields-title"
                  className={panel + " space-y-4"}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2
                        id="fields-title"
                        tabIndex={-1}
                        className="text-lg font-semibold"
                      >
                        Form fields
                      </h2>
                      <p className={hint}>
                        {fields.length}{" "}
                        {fields.length === 1 ? "field" : "fields"}
                      </p>
                    </div>
                    {newSchema && (
                      <Button
                        id="add-field"
                        size="sm"
                        variant="outline"
                        onClick={addField}
                      >
                        <Plus className="size-4" /> Add field
                      </Button>
                    )}
                  </div>
                  {fields.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                      Start with the first answer you need from the assignee.
                    </p>
                  )}
                  <ol className="space-y-2">
                    {fields.map((field, index) => {
                      const title = field.label || "Untitled field";
                      return (
                        <li
                          key={field.id}
                          className="rounded-lg border border-border"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                            <div className="min-w-0 flex-1">
                              <p className="break-words text-sm font-medium">
                                {title}
                              </p>
                              <p className="break-all text-xs text-muted-foreground">
                                {[
                                  fieldTypes[field.type],
                                  field.required ? "Required" : "Optional",
                                  field.defaultValue !== undefined
                                    ? "Default set"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            </div>
                            {newSchema && (
                              <div className="flex shrink-0">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label={"Move " + title + " up"}
                                  disabled={index === 0}
                                  onClick={() => moveField(index, index - 1)}
                                >
                                  <ArrowUp className="size-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label={"Move " + title + " down"}
                                  disabled={index === fields.length - 1}
                                  onClick={() => moveField(index, index + 1)}
                                >
                                  <ArrowDown className="size-4" />
                                </Button>
                                <Button
                                  id={"edit-" + field.id}
                                  size="icon"
                                  variant="ghost"
                                  aria-label={"Edit " + title}
                                  aria-expanded={selected === field.id}
                                  aria-controls={
                                    selected === field.id
                                      ? "editor-" + field.id
                                      : undefined
                                  }
                                  onClick={() =>
                                    setSelected(
                                      selected === field.id
                                        ? undefined
                                        : field.id,
                                    )
                                  }
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          {newSchema && selected === field.id && (
                            <div id={"editor-" + field.id}>
                              <FieldEditor
                                field={field}
                                onChange={(updated) =>
                                  updateFields(
                                    draft.map((item) =>
                                      item.id === field.id ? updated : item,
                                    ),
                                  )
                                }
                                onRemove={() => {
                                  updateFields(
                                    draft.filter(
                                      (item) => item.id !== field.id,
                                    ),
                                  );
                                  setSelected(undefined);
                                  setNotice(title + " removed.");
                                  document.getElementById("add-field")?.focus();
                                }}
                              />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                  <p aria-live="polite" className="sr-only">
                    {notice}
                  </p>
                </section>
                <div className="flex justify-end">
                  <Button onClick={review}>
                    Review form <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="min-w-0 border-t-2 border-primary/40 pt-5 lg:sticky lg:top-5 lg:border-t-0 lg:border-l-2 lg:pt-0 lg:pl-5">
                <FormPreview
                  key={previewKey}
                  fields={fields}
                  name={taskName}
                  description={description}
                />
                <a
                  className="mt-4 inline-block text-sm underline lg:hidden"
                  href="#fields-title"
                >
                  Back to form fields
                </a>
              </div>
            </div>
          </>
        ) : (
          <section className={panel + " max-w-3xl space-y-5"}>
            <div
              role="status"
              className="flex gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm"
            >
              {stage === "published" ? (
                <CheckCircle2 className="size-5 shrink-0 text-success-strong" />
              ) : (
                <Eye className="size-5 shrink-0" />
              )}
              <div>
                <p className="font-semibold">
                  {stage === "published"
                    ? "Definition published in simulation"
                    : "Ready to simulate publishing"}
                </p>
                <p className={hint}>
                  {stage === "published"
                    ? "The demo completed locally. No task or schema was registered."
                    : newSchema
                      ? "The simulation registers a new schema first, then creates a task definition that references it."
                      : "The simulation creates a task definition referencing the selected schema version."}
                </p>
              </div>
            </div>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className={hint}>Task definition</dt>
                <dd className="break-words font-medium">
                  {taskName.trim()} {stage === "published" && "· simulated v0"}
                </dd>
              </div>
              <div>
                <dt className={hint}>Minimum schema version</dt>
                <dd className="break-words font-medium">
                  {resolvedName} · v{newSchema ? 0 : reusedSchema.version}
                  {newSchema && " (simulated)"}
                </dd>
              </div>
            </dl>
            {description && (
              <p className={hint + " break-words"}>{description}</p>
            )}
            <div className="border-t border-border pt-4">
              <h2 className="font-semibold">Fields in form order</h2>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {fields.map((field) => (
                  <li key={field.id} className="break-words">
                    {field.label}{" "}
                    <span className="text-muted-foreground">
                      · {fieldTypes[field.type]}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <p className={hint}>
              New runs resolve the latest compatible schema at or above the
              minimum version. Existing runs keep their resolved version.
            </p>
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={() => changeStage("design")}>
                <ArrowLeft className="size-4" /> Back to builder
              </Button>
              {stage === "review" && (
                <Button onClick={() => changeStage("published")}>
                  Simulate publish
                </Button>
              )}
            </div>
          </section>
        )}
        <footer className="border-t border-border pt-4 text-xs text-muted-foreground">
          Sample data · Draft and results reset on reload
        </footer>
      </main>
    </div>
  );
}
