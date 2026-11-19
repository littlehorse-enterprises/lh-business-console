// Enums
export enum UserTaskStatus {
  UNASSIGNED = "UNASSIGNED",
  ASSIGNED = "ASSIGNED",
  DONE = "DONE",
  CANCELLED = "CANCELLED",
}

export enum UserTaskEventType {
  TASK_EXECUTED = "TASK_EXECUTED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_CANCELLED = "TASK_CANCELLED",
  TASK_COMPLETED = "TASK_COMPLETED",
  TASK_SAVED = "TASK_SAVED",
  COMMENT_ADDED = "COMMENT_ADDED",
  COMMENT_EDITED = "COMMENT_EDITED",
  COMMENT_DELETED = "COMMENT_DELETED",
}

export enum CustomUserIdClaim {
  // Matching the Java enum CustomUserIdClaim
  SUB = "SUB",
  PREFERRED_USERNAME = "PREFERRED_USERNAME",
  EMAIL = "EMAIL",
  ID = "ID",
}

// Common DTOs
export interface UserDTO {
  id: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  valid?: boolean;
}

export interface UserGroupDTO {
  id: string;
  name: string;
  valid?: boolean;
}

/** LittleHorse protobuf JSON. INT values are decimal strings to preserve 64-bit precision. */
export interface TaskVariableValue {
  str?: string;
  bool?: boolean;
  int?: string;
  /** Protobuf JSON accepts numbers, numeric strings, and NaN/Infinity/-Infinity. */
  double?: number | string;
  jsonObj?: string;
  jsonArr?: string;
  bytes?: string;
  wfRunId?: WorkflowRunId;
  utcTimestamp?: string;
  struct?: StructValue;
  array?: { items?: TaskVariableValue[]; elementType?: TypeDefinition };
  map?: {
    entries?: { key: TaskVariableValue; value: TaskVariableValue }[];
    mapType?: MapDefinition;
  };
}

export interface WorkflowRunId {
  id: string;
  parentWfRunId?: WorkflowRunId;
}

export interface StructDefId {
  name: string;
  version: number;
}

export interface StructValue {
  structDefId?: StructDefId;
  struct?: { fields?: Record<string, StructFieldValue> };
}

export interface StructFieldValue {
  /** An absent value or {} denotes explicit null; an absent field is omitted. */
  value?: TaskVariableValue;
  masked?: boolean;
}

export interface TypeDefinition {
  primitiveType?:
    | "STR"
    | "BOOL"
    | "INT"
    | "DOUBLE"
    | "JSON_OBJ"
    | "JSON_ARR"
    | "BYTES"
    | "WF_RUN_ID"
    | "TIMESTAMP";
  structDefId?: StructDefId;
  inlineStructDef?: InlineStructDefinition;
  inlineArrayDef?: { arrayType: TypeDefinition };
  inlineMapDef?: MapDefinition;
  masked?: boolean;
}

export interface MapDefinition {
  keyType: TypeDefinition;
  valueType: TypeDefinition;
}

export interface StructFieldDefinition {
  fieldType: TypeDefinition;
  defaultValue?: TaskVariableValue;
  isNullable?: boolean;
  description?: string;
}

export interface InlineStructDefinition {
  fields?: Record<string, StructFieldDefinition>;
}

export interface StructDefinition {
  id: StructDefId;
  description?: string;
  createdAt?: string;
  structDef?: InlineStructDefinition;
}

export interface TaskOutputRequest {
  /** Omit only for tasks without a result schema. */
  output?: TaskVariableValue;
}

export interface UserGroupListDTO {
  groups: UserGroupDTO[];
}

export interface SimpleUserTaskRunDTO {
  id: string;
  wfRunId: string;
  userTaskDefName: string;
  userGroup?: UserGroupDTO;
  user?: UserDTO;
  status: UserTaskStatus;
  notes?: string;
  scheduledTime: string; // ISO date string format
}

export interface UserTaskRunListDTO {
  userTasks: SimpleUserTaskRunDTO[];
  bookmark?: string;
}

export interface AuditEventDTO {
  time: string; // ISO date string format
  event:
    | UserTaskExecutedEvent
    | UserTaskAssignedEvent
    | UserTaskCancelledEvent
    | UserTaskCommentEvent
    | UserTaskCommentDeletedEvent
    | UserTaskCompletedEvent
    | UserTaskSavedEvent;
  type: UserTaskEventType;
}

export interface DetailedUserTaskRunDTO extends SimpleUserTaskRunDTO {
  resultStructDefId?: StructDefId;
  structDefs: StructDefinition[];
  output?: TaskVariableValue;
  events?: AuditEventDTO[];
}

export interface UserTaskExecutedEvent {
  wfRunId: string;
  userTaskGuid: string;
}

export interface UserTaskAssignedEvent {
  oldUserId?: string;
  oldUserGroup?: string;
  newUserId?: string;
  newUserGroup?: string;
}

export interface UserTaskCancelledEvent {
  message: string;
}

export interface UserTaskCommentEvent {
  comment: string;
  commentId: number;
  userId: string;
}

export interface UserTaskCommentDeletedEvent {
  commentId: number;
  userId: string;
}

export interface UserTaskCompletedEvent {
  message: string;
}

export interface UserTaskSavedEvent {
  userId: string;
  output?: TaskVariableValue;
}
