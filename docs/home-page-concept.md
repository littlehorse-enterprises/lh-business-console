# Business Console: Process Overview

An interactive frontend for the initial Business Console discussion, on branch
`codex/home-page-brainstorm`. The existing Next.js console renders it at
`/home-preview`; it requires no LittleHorse server, identity provider, or
Workflow Diffuser. Workflow IDs, order IDs, counts, times, and history are sample
values. Actions reset on reload.

## Preview

![Process Overview](home-page-concept/overview.png)

![Processes and Orders](home-page-concept/workflow-runs.png)

![Order details](home-page-concept/workflow-run.png)

## Terminology source

The example process comes from the user-supplied **Business Console Overview**
PDF. At the user's request, the UI calls workflows **Processes** and uses
business-facing names for orders, status, delivery time, and timeline entries.
Technical identifiers, metadata names, version numbers, and tenant labels are
not displayed. The document describes itself as a proposal; the frontend does
not establish a production configuration or API contract.

| UI terminology                                             | Source                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| Process Overview; Processes                                | User-requested wording for the document's Workflow Overview and workflows |
| Orders; Order details                                      | Business names for the document's order example and Workflow Run View     |
| User Tasks; Pending; Completed                             | Pages 1 and 3, user tasks and important-step history                      |
| Order ID; User; Status                                     | Readable labels for `order-id`, `user-id`, and `order-status`             |
| Timeline; Order picked up; Order delivered                 | Pages 1 and 3, event history; configuration messages                      |
| Metrics; Average delivery time                             | Pages 2-4, metrics and latency from pickup readiness to delivery          |
| Configuration; User Task Forms; Users, Groups, Permissions | Pages 1-4, feature and configuration sections                             |

The UI shows orders as the individual items in the example process. Technical
run IDs, WfSpec and WfRun labels, raw variable names and values, and event type
names remain outside the business-facing interface.

## Example from the proposal

- **Process example:** `process-order`, the `business_flows` entry in the
  configuration example, displayed as Order processing.
- **Status variable:** `order-status`.
- **Status values:** `BAKING`, `READY_FOR_PICKUP`, `PICKED_UP`, `DELIVERED`.
- **Public variables:** `order-id`, `user-id`, `order-status`.
- **Count:** Orders Out For Delivery, counting `PICKED_UP`.
- **Latency:** average time from ready for pickup to delivered.
- **Delivered orders:** last 30 days and previous 30 days.
- **WorkflowEvents:** `order-picked-up` and `order-delivered`, with readable
  messages following the examples in the configuration section.
- **User:** Bob, the example user named in the permissions section.

The aggregate metrics and the eight visible orders are sample values; the order
list is a subset of the totals. Order details show its status, user, pending
user task, and timeline. The sample user task has no configured form fields;
the proposal does not prescribe an input schema. Completing it advances the
sample order status and adds business-readable timeline entries.
Agent executions, form management, permissions, templates, and backend
integration remain outside this frontend demonstration.

## Run

From the repository root, using the versions listed in the main README:

```sh
pnpm install --frozen-lockfile
pnpm --dir api-client build
LHUT_METRICS_DISABLED=true pnpm --dir console dev --hostname 127.0.0.1 --port 3100
```

Open <http://127.0.0.1:3100/home-preview>.

## LittleHorse styling

The UI uses `@littlehorse-enterprises/ui-library` for buttons, cards, tables,
badges, inputs, selects, tabs, dialogs, and the order details sheet. The theme
toggle comes from the existing console. The header and sidebar follow Saddle's
structure; typography and neutral tables follow existing LittleHorse projects.

Color has a consistent purpose in both light and dark themes:

| Color   | Meaning                                                                                    |
| ------- | ------------------------------------------------------------------------------------------ |
| Blue    | Order statuses before delivery, users, and user task completion                            |
| Amber   | Pending user tasks; LittleHorse's primary color also marks selected navigation and actions |
| Green   | Delivered orders and completed user tasks                                                  |
| Neutral | Delivery time without a configured target, future statuses, and order IDs                  |

Color is accompanied by labels, values, or icons. No additional workflow status
or timing target is inferred from the sample values.

## Implementation boundaries

- `console/src/app/home-preview/` contains only the frontend and sample data.
- The auth proxy excludes exactly `/home-preview` and its trailing-slash variant.
  Tenant routes and similarly named routes still pass through authentication.
- The session provider receives an empty session only on that exact route.
- No backend, protobuf schema, generated API client, or production data changes.

## Validation

```sh
pnpm --dir console test
pnpm --dir console exec tsc --noEmit
LHUT_METRICS_DISABLED=true pnpm --dir console build
```

The proxy test checks the exact public route and protected tenant paths. Browser
checks cover the process and user-task views, search by user and order ID,
status filters, reporting periods, user task completion, order details, timeline
entries, Escape dismissal, light/dark themes, and desktop/mobile layouts.
