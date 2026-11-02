# Business Console: User Tasks refactor

Branch: `codex/home-page-brainstorm`.

The October 28 meeting narrowed the next step to moving the existing User Tasks
Bridge screens into the Business Console sidebar. The authenticated application
now uses task and form tables backed by the existing API, with task actions in a
right-side detail panel. User and group management remain available. The earlier
order dashboard remains at `/home-preview` as a separate, sample-data concept;
it is not the application landing page.

## Preview

![Tasks](user-task-refactor/tasks.png)

![Forms](user-task-refactor/forms.png)

![Existing comments action](user-task-refactor/comments.png)

[Mobile task view](user-task-refactor/mobile.png)

## Decisions from the meeting

Source: the supplied 24:58 Zoom recording, `video1671677937.mp4` and its separate
`audio1671677937.m4a`. The transcript was checked against sampled video frames,
including the side-by-side screens and annotations. Times are relative to the
recording. Media and the full transcript remain outside this repository.

| Time        | Decision                                                                      | Implementation                                                                                                    |
| ----------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 00:04–00:12 | Use workflow terminology rather than processes.                               | The earlier workflow concept uses the agreed wording. Business-facing navigation avoids metadata type names.      |
| 00:29–03:10 | Start from the working User Tasks UI and retain its capabilities.             | Use task and form tables while reusing the existing forms, dialogs, API actions, and management components.       |
| 06:51–08:00 | People who only complete tasks should have a focused entry point.             | Ordinary users land on their tasks, with no admin menu. Existing role checks remain in place.                     |
| 09:02–10:47 | Group form and task views beneath User Tasks; start with this menu.           | The sidebar contains Tasks and Forms; Users and Groups sit under Administration.                                  |
| 16:18–17:04 | Treat the first step as a refactor; define workflow visualization separately. | The authenticated landing page contains real tasks. Workflow and analytics views are not added to its navigation. |
| 18:23–19:09 | Comments must carry over to the new interface.                                | Existing comment create/edit/delete dialogs remain available in the task detail panel.                            |
| 19:09–21:25 | Remove large account-count cards; keep counts in their relevant views.        | Forms have a small count; user/group tables and task lists retain inline result counts.                           |
| 24:23–24:40 | Carry the sidebar and all current features over incrementally.                | Existing routes, profile view switching, filters, pagination, and task actions remain available.                  |

## Table layout

Tasks use the same compact table in the administrator list, My tasks, Available
tasks, and the tasks for a form. Rows show the form name and a short reference,
status, assignee, group, and scheduled date. Opening a row shows the selected
task in a right-side panel with its notes, full copyable references, and the
existing assignment, completion, claiming, cancellation, comments, and results
dialogs. The panel follows live task updates and closes when the task leaves the
current filtered list. Task identity combines the workflow reference and task
ID, since a task ID alone is not unique across workflows.

Forms use a searchable table with total, available, and assigned-to-me counts.
The form name and View tasks action open that form's task table. Counts indicate
an additional page with a plus sign; failed counts display an unavailable value
rather than zero. Forms remain navigable if a count request fails.

Both tables retain horizontal scrolling on smaller screens instead of reverting
to cards. Available-task pagination includes every loaded page; its date filters
are forwarded to the existing API, while group selection stays in its group tabs.

Table styling follows Saddle's Tasks and Workflows lists: the shared UI-library
table sits directly on the page, with unfilled headers, standard cell padding,
subtle row separators, and left-aligned 32px ghost icon actions with tooltips.
Search inputs use Saddle's compact width and clear control. Status badges use
Saddle's semantic soft fills and contrast-adjusted text colors; cancelled tasks
are neutral. The utility build also follows Saddle's single-preflight setup.
Reference: `lh-saddle/ui/src/components/tasks/TaskTable.tsx`, `TaskRow.tsx`,
`TaskActions.tsx`, and `ui/src/app/theme-override.css` on Saddle's main branch.

## Navigation and existing capabilities

| View                | URL beneath `/<tenant>`         | Existing behavior retained                                                                                                     |
| ------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Administrator tasks | `/admin` or `/admin?view=tasks` | Tasks across forms, search, status/date/group filters, pagination, assignment, completion, cancellation, comments, and results |
| Forms               | `/admin?view=forms`             | Registered forms, per-form task counts, and opening the tasks for a form                                                       |
| Tasks for a form    | `/admin/<form-name>`            | All statuses for that form, filters, pagination, task actions, and a link back to Forms                                        |
| Users               | `/admin?view=users`             | Create, edit, enable/disable, role changes, passwords, groups, and deletion through the existing management component          |
| Groups              | `/admin?view=groups`            | Create, edit, membership management, individual/bulk deletion, and pagination                                                  |
| My tasks            | `/`                             | Assigned tasks, search, filters, completion, cancellation, results, and comments                                               |
| Available tasks     | Available tasks tab on `/`      | Group selection, pagination, and claiming tasks                                                                                |

Administrators can still switch to the user view from the account menu. Legacy
`?tab=tasks`, `?tab=users`, and `?tab=groups` links resolve to their original
form/user/group views. Administrator controls are omitted for ordinary users;
the existing authentication proxy and backend authorization still protect them.

The existing search API needs a status when searching across forms. The new
administrator task view therefore starts with **In progress**, with **Available**,
**Completed**, and **Cancelled** options. Selecting a form still permits all
statuses. Task filters preserve the selected sidebar view, and only supported
filter parameters are forwarded to the API. Result counts describe loaded
records rather than claiming a global total.

If group lookup fails, assigned tasks remain available with a group-specific
error. Group lookup and claiming still require the identity provider permissions
expected by the existing adapter; the frontend does not change those permissions.

## Scope and deferred work

- Reuse `@littlehorse-enterprises/ui-library`, the approved sidebar styling, and
  the existing functional User Tasks screens. Status colors keep their meaning.
- Keep technical type names out of navigation and user-facing descriptions.
  Existing copyable task/workflow references remain available in task details.
- No backend, protobuf, generated API client, authentication policy, or production
  data changes. Local verification uses the separate demo environment.
- Creating/registering forms and a form builder were discussed at 06:04–06:33
  and 17:30–18:23. They need a separate definition and are not represented by a
  nonfunctional create button or a new invented API.
- Workflow templates, status trackers, mapping multiple nodes to business steps,
  and analytics/data exploration were discussed as follow-up work, not this
  refactor. The sample order dashboard is retained only for that discussion.

## Run

Follow the repository README to start the backend and identity provider. Then:

```sh
pnpm install --frozen-lockfile
pnpm --dir api-client build
# Configure console/.env.local from console/.env.sample for your local services.
AUTH_URL=http://localhost:3101 LHUT_METRICS_DISABLED=true pnpm --dir console dev --hostname 127.0.0.1 --port 3101
```

Open <http://localhost:3101/default> for the user view or
<http://localhost:3101/default/admin> for the administrator view. Authentication
is required. The repository's demo administrator is `my-admin-user` / `1234`.
The earlier sample-only concept remains at `/home-preview`.

The client-scoped Keycloak theme also matches the custom login page during the
username/password step. See [Keycloak setup](../keycloak/README.md) for local
and separately managed identity providers.

## Validation

```sh
pnpm --dir console test
pnpm --dir console exec tsc --noEmit
LHUT_METRICS_DISABLED=true pnpm --dir console build
```

Regression tests cover legacy navigation, preserving sidebar state when filters
change, forwarding only task filters to the API, existing role extraction, and
the exact public preview route. Browser verification uses real local API calls
for administrator and ordinary-user navigation, tasks by form/status, comments,
completion, results, assignment controls, available tasks/claiming, user/group
management views, and responsive layouts.
