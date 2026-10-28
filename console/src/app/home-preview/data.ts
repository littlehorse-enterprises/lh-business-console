// Fictional, browser-local fixtures for the home page design discussion.
export const processes = [
  {
    id: "onboarding",
    name: "Customer onboarding",
    description: "From first hello to ready for business.",
    icon: "customer",
    active: 62,
    completed: [118, 472],
    turnaround: "2.4 days",
    stages: ["Application", "Document review", "Approval", "Welcome"],
    distribution: [18, 24, 12, 8],
    color: "purple",
  },
  {
    id: "purchasing",
    name: "Purchase approvals",
    description: "Keep every request moving forward.",
    icon: "purchase",
    active: 47,
    completed: [94, 386],
    turnaround: "1.2 days",
    stages: ["Request", "Manager review", "Finance approval", "Ordered"],
    distribution: [11, 19, 10, 7],
    color: "blue",
  },
  {
    id: "invoicing",
    name: "Invoice processing",
    description: "A clearer path from received to paid.",
    icon: "invoice",
    active: 37,
    completed: [72, 310],
    turnaround: "1.8 days",
    stages: ["Received", "Verification", "Approval", "Payment"],
    distribution: [8, 14, 9, 6],
    color: "green",
  },
] as const;

export type Process = (typeof processes)[number];
export type ProcessId = Process["id"];
export type BusinessCase = {
  id: string;
  name: string;
  processId: ProcessId;
  stage: number;
  attention: boolean;
  reason: string;
  owner: string;
  due: string;
  mine: boolean;
};

export const initialCases: BusinessCase[] = [
  {
    id: "ONB-1042",
    name: "Acme Corporation",
    processId: "onboarding",
    stage: 1,
    attention: true,
    reason: "Documents need review",
    owner: "Alex Morgan",
    due: "Today",
    mine: true,
  },
  {
    id: "PUR-2081",
    name: "Design team equipment",
    processId: "purchasing",
    stage: 1,
    attention: true,
    reason: "Waiting for your approval",
    owner: "Alex Morgan",
    due: "Today",
    mine: true,
  },
  {
    id: "PUR-2076",
    name: "Annual software renewal",
    processId: "purchasing",
    stage: 2,
    attention: true,
    reason: "Approval overdue",
    owner: "Jamie Chen",
    due: "1 day overdue",
    mine: false,
  },
  {
    id: "ONB-1038",
    name: "Northstar Studio",
    processId: "onboarding",
    stage: 2,
    attention: true,
    reason: "Decision needed",
    owner: "Sam Taylor",
    due: "Today",
    mine: false,
  },
  {
    id: "INV-3064",
    name: "Brightside · INV-2409",
    processId: "invoicing",
    stage: 1,
    attention: true,
    reason: "Verify invoice details",
    owner: "Alex Morgan",
    due: "Tomorrow",
    mine: true,
  },
  {
    id: "PUR-2084",
    name: "Office supplies",
    processId: "purchasing",
    stage: 1,
    attention: true,
    reason: "Budget review needed",
    owner: "Jamie Chen",
    due: "Tomorrow",
    mine: false,
  },
  {
    id: "ONB-1045",
    name: "Evergreen Partners",
    processId: "onboarding",
    stage: 1,
    attention: true,
    reason: "Documents need review",
    owner: "Sam Taylor",
    due: "Tomorrow",
    mine: false,
  },
  {
    id: "PUR-2087",
    name: "Customer workshop travel",
    processId: "purchasing",
    stage: 2,
    attention: true,
    reason: "Finance approval needed",
    owner: "Jamie Chen",
    due: "Tomorrow",
    mine: false,
  },
  {
    id: "ONB-1040",
    name: "Pioneer Labs",
    processId: "onboarding",
    stage: 3,
    attention: false,
    reason: "Welcome in progress",
    owner: "Sam Taylor",
    due: "On track",
    mine: false,
  },
  {
    id: "INV-3068",
    name: "Atlas · INV-2412",
    processId: "invoicing",
    stage: 3,
    attention: false,
    reason: "Payment scheduled",
    owner: "Jamie Chen",
    due: "On track",
    mine: false,
  },
  {
    id: "PUR-2089",
    name: "New starter equipment",
    processId: "purchasing",
    stage: 0,
    attention: false,
    reason: "Request received",
    owner: "Sam Taylor",
    due: "On track",
    mine: false,
  },
];

export const weeklyActivity = [32, 48, 37, 54, 61, 28, 24];
export const monthlyActivity = [142, 168, 195, 211, 158, 174, 120];
