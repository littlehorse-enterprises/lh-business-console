// Sample values for the process-order example in Business Console Overview.
export const orderStatuses = [
  { value: "BAKING", label: "Baking" },
  { value: "READY_FOR_PICKUP", label: "Ready for pickup" },
  { value: "PICKED_UP", label: "Picked up" },
  { value: "DELIVERED", label: "Delivered" },
] as const;

export type OrderStatus = (typeof orderStatuses)[number]["value"];
export const workflowSpec = {
  name: "process-order",
  displayName: "Order processing",
  statusVariable: "order-status",
  ordersOutForDelivery: 12,
  delivered: [284, 246],
  latency: ["18 min", "22 min"],
} as const;

export type WorkflowRun = {
  id: string;
  orderId: string;
  userId: string;
  status: OrderStatus;
  userTask: "pending" | "executed" | null;
};

export const initialWorkflowRuns: WorkflowRun[] = [
  {
    id: "f84e82e904ef4af8bc9a1c4200001042",
    orderId: "1042",
    userId: "Bob",
    status: "READY_FOR_PICKUP",
    userTask: "pending",
  },
  {
    id: "f84e82e904ef4af8bc9a1c4200001043",
    orderId: "1043",
    userId: "Bob",
    status: "READY_FOR_PICKUP",
    userTask: "pending",
  },
  {
    id: "f84e82e904ef4af8bc9a1c4200001044",
    orderId: "1044",
    userId: "Bob",
    status: "PICKED_UP",
    userTask: "pending",
  },
  {
    id: "f84e82e904ef4af8bc9a1c4200001045",
    orderId: "1045",
    userId: "Bob",
    status: "BAKING",
    userTask: null,
  },
  {
    id: "f84e82e904ef4af8bc9a1c4200001046",
    orderId: "1046",
    userId: "Bob",
    status: "PICKED_UP",
    userTask: null,
  },
  {
    id: "f84e82e904ef4af8bc9a1c4200001047",
    orderId: "1047",
    userId: "Bob",
    status: "PICKED_UP",
    userTask: null,
  },
  {
    id: "f84e82e904ef4af8bc9a1c4200001048",
    orderId: "1048",
    userId: "Bob",
    status: "DELIVERED",
    userTask: null,
  },
  {
    id: "f84e82e904ef4af8bc9a1c4200001049",
    orderId: "1049",
    userId: "Bob",
    status: "DELIVERED",
    userTask: null,
  },
];

export const deliveredOrders = [32, 48, 37, 54, 61, 28, 24];
export const previousDeliveredOrders = [25, 42, 31, 49, 56, 23, 20];
