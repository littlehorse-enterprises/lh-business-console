# Business Console home page concept

An interactive starting point for the team discussion, on branch
`codex/home-page-brainstorm`. The existing Next.js console renders this concept
at `/home-preview`; it requires no LittleHorse server, identity provider, or
Diffuser. All cases, names, metrics, and history are fictional.

## Preview

![Home overview](home-page-concept/overview.png)

![Attention queue and activity](home-page-concept/attention.png)

![Business case tracker](home-page-concept/case-tracker.png)

## Run

From the repository root, using the versions listed in the main README:

```sh
pnpm install --frozen-lockfile
pnpm --dir api-client build
LHUT_METRICS_DISABLED=true pnpm --dir console dev --hostname 127.0.0.1 --port 3100
```

Open <http://127.0.0.1:3100/home-preview>.

## Explore

- **Overview:** portfolio of business processes, cross-process counts, attention
  queue, and completion activity.
- **Processes:** filter by process, status, customer/request, case reference, or
  responsible person. The fixture list is a representative subset of the totals.
- **Case details:** business stages in a step tracker, public-facing business
  details, and a readable event history.
- **My tasks:** the sample user's outstanding reviews. Approve a review with a
  note to advance the case and update its attention count, or request changes
  and see the note in case history. Changes last until reload.
- **Insights:** switch between 7- and 30-day illustrative reports and compare
  process turnaround times. In-progress and attention counts are current-state
  snapshots; completion counts and turnaround use the selected reporting period.
- **About this concept:** the scope and questions for the next team discussion.

Task forms and people/access appear as planned navigation ideas. There is no
workflow designer, template builder, access-control implementation, or live
report query engine in this prototype. The home concept is deliberately a
separate route so existing task-management screens remain usable.

## Basis in the October 26 recording

The recording is product context, not an instruction to carry out every action
mentioned in the meeting. The relevant discussion points were:

| Approximate time | Design implication                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 03:20–07:15      | Design for business people; express progress as business stages rather than engine nodes. Phase one focuses on existing processes and assigned human tasks. |
| 07:22–09:51      | Show metrics that managers and business analysts can interpret, such as time to complete a business stage.                                                  |
| 15:26–18:53      | Start with a home page and sidebar in the actual frontend; use the visualization to discuss the backend data it will need.                                  |
| 19:26–21:28      | Give assigned user tasks a place in the sidebar; the existing task-oriented roles need further design.                                                      |
| 29:43–31:23      | Use a branch of the repository for an initial UI that both collaborators can change. This is a discovery artifact.                                          |
| 34:00–36:27      | Explore filtering and reports; detailed query/report configuration remains future work.                                                                     |
| 41:56–43:02      | Business metrics may combine multiple workflow specifications. The overview totals therefore span business processes.                                       |

The example business processes, visual style, fixture values, and information
hierarchy are proposals for discussion, not settled requirements from the call.

## Additional context: overview proposal

The user supplied the five-page **Business Console Overview** PDF after the
first prototype. It describes itself as Colt's opinionated proposal. The points
below are product context; feature priority, configuration formats, and
architecture choices still need team agreement.

The console combines operating business processes with business analytics.
Engineers configure a business view of selected workflows: which variable defines
status, what each status means, which variables to expose, how workflow events
become readable messages, and which metrics to display. Business users then use
that view to understand progress and complete their human steps.

| Proposal topic                                   | Implication for the concept                                                                                                                       | Current coverage / discussion gap                                                                                                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workflow overview (p. 2)                         | Show counts in a business status, time between named statuses, business-key search, and period-over-period outcomes.                              | The prototype has portfolio counts, case search, completion trends, and end-to-end turnaround. Per-status counts and transition latency are not yet visualized.                              |
| Workflow run view (pp. 2-3)                      | Drive the tracker from a configured status variable and expose only the configured business fields.                                               | The tracker and business details use fixtures. Their mapping to status values and public workflow variables remains to be defined.                                                           |
| Important-step history (p. 3)                    | A case timeline combines pending/completed human tasks, meaningful WorkflowEvents, and agent executions.                                          | The current timeline illustrates human reviews and process start. WorkflowEvent messages and agent activity are additional design work.                                                      |
| Agent executions (p. 1)                          | Give business users and auditors a readable view of available agent execution details and tool calls.                                             | No agent execution view exists in this prototype. Decide whether it is nested in a case timeline, a separate screen, or both, and which recorded information can be shown.                   |
| Users, groups, permissions (p. 2)                | Scope visibility to permitted workflows and consider administration within a group.                                                               | The sample operations-manager persona is illustrative. People/access is a navigation idea; the role and permission model remains open.                                                       |
| User tasks and forms (pp. 1, 4)                  | Keep task execution central and support management of task forms.                                                                                 | Sample reviews illustrate execution. Form authoring and the proposed migration to v2 user tasks remain separate work.                                                                        |
| Workflow templates (p. 3)                        | Explore controlled self-service using templates supplied by engineers and filled in by business users.                                            | The document calls this the most ambitious feature. Template creation, configuration, and execution remain outside this initial home concept; the meeting also left template ownership open. |
| Configuration and metrics architecture (pp. 3-4) | Explore YAML business-flow configuration, an optional configuration-provider plugin, and Diffuser-calculated metric windows.                      | The fixtures are not a configuration schema. The frontend/backend contract and deployment design still need investigation.                                                                   |
| Product strategy (p. 5)                          | Phase one makes automated processes usable by business teams; later phases build on forms, permissions, templates, and packaged business modules. | Use the current branch to discuss daily operations first, while retaining these longer-term capabilities in the design context.                                                              |

### Priorities for the next visual iteration

1. Explore an order-tracking example with business-key search, a configured
   shipping status, and shipping-to-delivery duration, matching the proposal's
   concrete example.
2. Make the case timeline show different event types: a pending human task, a
   completed task, a business message from a WorkflowEvent, and agent/tool activity.
3. Show how each process selects its visible fields and metrics. The current
   three process cards and shared counters are illustrative examples.
4. Discuss permission-aware home views and the placement of forms and group
   management before expanding the navigation.

## Questions to resolve

1. Which audience and role should the default home serve?
2. Should the most prominent content be exceptions, personal tasks, or metrics?
3. How do configured status variables, public fields, and meaningful events map to one or more workflow specs?
4. Which metrics describe time in a status, time between statuses, or aggregates across processes, and over what windows?
5. What belongs in the home summary versus a separate task or process screen?
6. Where should task-form authoring, group administration, agent execution details, and future templates live?

## Implementation boundaries

- `console/src/app/home-preview/` contains only the prototype and fixtures.
- The auth proxy excludes exactly `/home-preview` and its trailing-slash variant.
  Tenant routes and similarly named routes still pass through authentication.
- The root session provider receives an empty session only on that exact demo
  route, avoiding identity-provider calls when previewing fixtures.
- No backend, schema, generated API contract, or production data is changed.

## Validation

```sh
pnpm --dir console test
pnpm --dir console exec tsc --noEmit
LHUT_METRICS_DISABLED=true pnpm --dir console build
```

The proxy regression test verifies that the exact preview route is public and
that tenant routes, preview subpaths, and similar prefixes retain authentication.
Manual browser checks cover navigation, combined filtering, empty results,
reporting periods, the case tracker, required review notes, sample completion,
request-changes history, Escape dismissal, and a 390px mobile viewport.
