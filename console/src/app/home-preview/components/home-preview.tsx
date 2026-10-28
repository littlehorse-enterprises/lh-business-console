"use client";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  ListFilter,
  Search,
  ShoppingBag,
  Sparkles,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  initialCases,
  monthlyActivity,
  processes,
  weeklyActivity,
  type BusinessCase,
  type Process,
} from "../data";
import styles from "../home-preview.module.css";

type View = "overview" | "processes" | "tasks" | "insights";
const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "processes", label: "Processes", icon: Workflow },
  { id: "tasks", label: "My tasks", icon: ClipboardCheck },
  { id: "insights", label: "Insights", icon: BarChart3 },
] as const;
const titles: Record<View, string> = {
  overview: "A little clarity. A lot of progress.",
  processes: "Your processes, at a glance.",
  tasks: "Make the next move.",
  insights: "See the bigger picture.",
};

function ProcessIcon({ process }: { process: Process }) {
  const Icon =
    process.icon === "customer"
      ? Users
      : process.icon === "purchase"
        ? ShoppingBag
        : FileText;
  return (
    <span className={`${styles.processIcon} ${styles[process.color]}`}>
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}

export default function HomePreview() {
  const [view, setView] = useState<View>("overview");
  const [period, setPeriod] = useState("7");
  const [query, setQuery] = useState("");
  const [processFilter, setProcessFilter] = useState("all");
  const [attentionOnly, setAttentionOnly] = useState(true);
  const [cases, setCases] = useState(initialCases);
  const [selectedCase, setSelectedCase] = useState<BusinessCase | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const taskNotes = useRef<HTMLTextAreaElement>(null);
  const [caseActivity, setCaseActivity] = useState<
    Record<string, { action: string; note: string }[]>
  >({});
  const [decision, setDecision] = useState("approve");
  const completedIds = useRef(new Set<string>());
  const attentionCount = cases.filter((item) => item.attention).length;
  const myTasks = cases.filter((item) => item.mine && item.attention);
  const periodIndex = period === "7" ? 0 : 1;
  const completed = processes.reduce(
    (sum, process) => sum + process.completed[periodIndex],
    0,
  );
  const activity = period === "7" ? weeklyActivity : monthlyActivity;
  const filteredCases = cases.filter((item) => {
    const process = processes.find((process) => process.id === item.processId)!;
    return (
      (view !== "tasks" || (item.mine && item.attention)) &&
      (!attentionOnly || item.attention || view === "tasks") &&
      (processFilter === "all" || item.processId === processFilter) &&
      `${item.name} ${item.id} ${item.owner} ${process.name} ${item.reason}`
        .toLowerCase()
        .includes(query.toLowerCase().trim())
    );
  });
  const visibleProcesses = processes.filter(
    (process) =>
      process.name.toLowerCase().includes(query.toLowerCase().trim()) ||
      cases.some(
        (item) =>
          item.processId === process.id &&
          `${item.name} ${item.id}`
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
      ),
  );
  const selectedProcess = processes.find(
    (process) => process.id === selectedCase?.processId,
  );

  useEffect(() => {
    if (selectedCase || notesOpen) {
      if (!dialog.current?.open) dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [selectedCase, notesOpen]);

  function navigate(next: View) {
    setView(next);
    setProcessFilter("all");
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeDialog() {
    setSelectedCase(null);
    setNotesOpen(false);
  }

  function openCase(item: BusinessCase) {
    setDecision("approve");
    setSelectedCase(item);
  }

  function completeTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCase) return;
    const note = taskNotes.current?.value.trim() || "";
    if (!note) {
      taskNotes.current?.setCustomValidity("Add a review note.");
      taskNotes.current?.reportValidity();
      return;
    }
    setCaseActivity((history) => ({
      ...history,
      [selectedCase.id]: [
        {
          action:
            decision === "approve"
              ? "Review approved by Alex Morgan"
              : "Changes requested by Alex Morgan",
          note,
        },
        ...(history[selectedCase.id] || []),
      ],
    }));
    if (decision === "request-changes") {
      setCases((items) =>
        items.map((item) =>
          item.id === selectedCase.id
            ? { ...item, reason: "Changes requested" }
            : item,
        ),
      );
      setAnnouncement(
        `Sample update: changes requested for ${selectedCase.name}. The task stays open.`,
      );
      closeDialog();
      return;
    }
    const updated = {
      ...selectedCase,
      attention: false,
      stage: Math.min(selectedCase.stage + 1, 3),
      reason: "Moving to the next stage",
    };
    setCases((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );
    completedIds.current.add(updated.id);
    setAnnouncement(
      `Sample task completed for ${updated.name}. The process has moved to the next stage.`,
    );
    closeDialog();
  }

  function ActivityChart({ compact = false }: { compact?: boolean }) {
    return (
      <section
        className={`${styles.panel} ${styles.activityPanel}`}
        aria-label="Completed process activity"
      >
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>A little momentum</span>
            <h2>Completed processes</h2>
          </div>
          <BarChart3 size={19} />
        </div>
        <div className={styles.chartSummary}>
          <strong>{completed.toLocaleString()}</strong>
          <span>across {period === "7" ? "7" : "30"} days</span>
        </div>
        <div
          className={styles.chart}
          style={{ height: compact ? 116 : 210 }}
          role="img"
          aria-label={`${completed} completed processes. ${activity.map((value, index) => `${period === "7" ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][index] : `Period ${index + 1}`}: ${value}`).join(", ")}.`}
        >
          {activity.map((value, index) => (
            <div className={styles.chartColumn} key={index}>
              <span
                className={styles.chartBar}
                style={{ height: `${(value / Math.max(...activity)) * 100}%` }}
              >
                <span>{value}</span>
              </span>
              <small>
                {period === "7"
                  ? ["M", "T", "W", "T", "F", "S", "S"][index]
                  : ["1–4", "5–8", "9–12", "13–16", "17–20", "21–24", "25–30"][
                      index
                    ]}
              </small>
            </div>
          ))}
        </div>
        <p className={styles.chartFootnote}>
          <span className={styles.dot} /> Completed business processes{" "}
          <span className={styles.fixtureLabel}>Sample data</span>
        </p>
      </section>
    );
  }

  return (
    <div className={styles.shell}>
      <a href="#preview-main" className={styles.skipLink}>
        Skip to content
      </a>
      <aside className={styles.sidebar} aria-label="Main navigation">
        <a href="/home-preview" className={styles.brand}>
          <img src="/images/logo-white.svg" width="36" height="32" alt="" />
          <span>
            LittleHorse<small>BUSINESS CONSOLE</small>
          </span>
        </a>
        <div className={styles.workspace}>
          <span className={styles.workspaceAvatar}>A</span>
          <div>
            Acme operations<small>Sample workspace</small>
          </div>
        </div>
        <span className={styles.navLabel}>WORKSPACE</span>
        <nav>
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              aria-current={view === id ? "page" : undefined}
              className={`${styles.navItem} ${view === id ? styles.navActive : ""}`}
            >
              <Icon size={19} />
              {label}
              {id === "tasks" && (
                <span className={styles.navCount}>{myTasks.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className={styles.futureNav}>
          <span className={styles.navLabel}>BUILD & MANAGE</span>
          <span>
            <FileText size={18} /> Task forms <small>Planned</small>
          </span>
          <span>
            <Users size={18} /> People & access <small>Planned</small>
          </span>
        </div>
        <div className={styles.sidebarBottom}>
          <div className={styles.conceptCard}>
            <Sparkles size={18} />
            <strong>
              A starting point for
              <br />
              what comes next.
            </strong>
            <p>
              Explore the concept.
              <br />
              Help shape the console.
            </p>
            <button onClick={() => setNotesOpen(true)}>
              About this concept <ArrowUpRight size={14} />
            </button>
          </div>
          <div className={styles.profile}>
            <span className={styles.profileAvatar}>AM</span>
            <div>
              Alex Morgan<small>Operations manager · Demo</small>
            </div>
          </div>
        </div>
      </aside>

      <div className={styles.mainShell}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>
            Workspace <ChevronRight size={14} />
            <strong>
              {navigation.find((item) => item.id === view)?.label}
            </strong>
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.previewBadge}>
              <span /> Concept preview
            </span>
            <button
              className={styles.iconButton}
              aria-label="About this concept"
              onClick={() => setNotesOpen(true)}
            >
              <CircleHelp size={19} />
            </button>
          </div>
        </header>
        <main id="preview-main" className={styles.main}>
          <div className={styles.pageHeading}>
            <div>
              <p className={styles.greeting}>YOUR BUSINESS, IN MOTION</p>
              <h1>{titles[view]}</h1>
              <p>
                A shared view of your processes, your people, and what needs you
                next.
              </p>
            </div>
            <label className={styles.periodControl}>
              <Clock3 size={15} />
              <span className={styles.srOnly}>Reporting period</span>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>

          <div className={styles.statsGrid}>
            <button
              className={styles.stat}
              onClick={() => {
                navigate("processes");
                setAttentionOnly(false);
              }}
            >
              <span>
                In progress <Workflow size={17} />
              </span>
              <strong>
                146<small>processes</small>
              </strong>
              <p>
                <span className={styles.neutralDot} /> Across 3 business
                processes
              </p>
            </button>
            <button
              className={`${styles.stat} ${styles.attentionStat}`}
              onClick={() => {
                navigate("processes");
                setAttentionOnly(true);
              }}
            >
              <span>
                Needs attention <Clock3 size={17} />
              </span>
              <strong>
                {attentionCount}
                <small>cases</small>
              </strong>
              <p>
                <span className={styles.amberDot} /> {myTasks.length} waiting on
                you <ArrowRight size={13} />
              </p>
            </button>
            <button
              className={styles.stat}
              onClick={() => navigate("insights")}
            >
              <span>
                Completed <CheckCheck size={18} />
              </span>
              <strong>
                {completed.toLocaleString()}
                <small>processes</small>
              </strong>
              <p>
                <span className={styles.positive}>
                  <ArrowUpRight size={13} /> 12.7%
                </span>{" "}
                vs. previous period
              </p>
            </button>
            <button
              className={styles.stat}
              onClick={() => navigate("insights")}
            >
              <span>
                Onboarding turnaround <Clock3 size={17} />
              </span>
              <strong>
                {period === "7" ? "2.4" : "2.7"}
                <small>days</small>
              </strong>
              <p>
                <span className={styles.positive}>
                  <ArrowDownRight size={13} /> {period === "7" ? "0.6" : "0.3"}{" "}
                  days
                </span>{" "}
                vs. previous period
              </p>
            </button>
          </div>

          {(view === "overview" || view === "processes") && (
            <section
              className={styles.processSection}
              aria-labelledby="process-heading"
            >
              <div className={styles.sectionHeading}>
                <div>
                  <h2 id="process-heading">
                    Business processes{" "}
                    <span className={styles.countBadge}>3</span>
                  </h2>
                  <p>The work behind your everyday operations.</p>
                </div>
                {view === "overview" && (
                  <button
                    className={styles.textButton}
                    onClick={() => {
                      navigate("processes");
                      setAttentionOnly(false);
                    }}
                  >
                    Explore processes <ArrowRight size={15} />
                  </button>
                )}
              </div>
              <div className={styles.processGrid}>
                {visibleProcesses.map((process) => {
                  const attention = cases.filter(
                    (item) => item.processId === process.id && item.attention,
                  ).length;
                  return (
                    <button
                      key={process.id}
                      aria-pressed={processFilter === process.id}
                      className={`${styles.processCard} ${processFilter === process.id ? styles.selectedCard : ""}`}
                      onClick={() => {
                        setProcessFilter(
                          processFilter === process.id ? "all" : process.id,
                        );
                        setAttentionOnly(false);
                      }}
                    >
                      <div className={styles.cardTop}>
                        <ProcessIcon process={process} />
                        <span>
                          {attention} need{attention === 1 ? "s" : ""} attention
                        </span>
                        <ArrowUpRight size={17} />
                      </div>
                      <h3>{process.name}</h3>
                      <p>{process.description}</p>
                      <div className={styles.cardNumbers}>
                        <strong>
                          {process.active}
                          <small>in progress</small>
                        </strong>
                        <span>
                          <Check size={13} /> {process.completed[periodIndex]}{" "}
                          completed
                        </span>
                      </div>
                      <div
                        className={styles.distribution}
                        aria-label={`Active cases by stage: ${process.stages.map((stage, index) => `${stage}: ${process.distribution[index]}`).join(", ")}`}
                      >
                        {process.distribution.map((amount, index) => (
                          <span
                            key={index}
                            style={{ flex: amount, opacity: 1 - index * 0.19 }}
                            className={styles[process.color]}
                          />
                        ))}
                      </div>
                      <div className={styles.cardFooter}>
                        <span>{process.stages.length} business stages</span>
                        <span>
                          View cases <ChevronRight size={13} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {visibleProcesses.length === 0 && (
                <p className={styles.emptyState}>
                  No processes match “{query}”. Try another search.
                </p>
              )}
            </section>
          )}

          {view !== "insights" && (
            <div
              className={`${styles.lowerGrid} ${view !== "overview" ? styles.fullWidth : ""}`}
            >
              <section
                className={`${styles.panel} ${styles.workPanel}`}
                aria-labelledby="work-heading"
              >
                <div className={styles.sectionHeading}>
                  <div>
                    <h2 id="work-heading">
                      {view === "tasks"
                        ? "Your next steps"
                        : attentionOnly
                          ? "A little attention goes a long way."
                          : "Process cases"}
                    </h2>
                    <p>
                      {view === "tasks"
                        ? "The human steps that keep your processes moving."
                        : "See what's happening. Pick up where it matters."}
                    </p>
                  </div>
                  {view === "overview" && (
                    <button
                      className={styles.roundButton}
                      aria-label="See all process cases"
                      onClick={() => {
                        navigate("processes");
                        setAttentionOnly(false);
                      }}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  )}
                </div>
                <div className={styles.tableTools}>
                  <label className={styles.search}>
                    <Search size={16} />
                    <span className={styles.srOnly}>Search cases</span>
                    <input
                      placeholder="Search by name, case, or process…"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </label>
                  <label className={styles.processSelect}>
                    <ListFilter size={15} />
                    <span className={styles.srOnly}>Filter by process</span>
                    <select
                      value={processFilter}
                      onChange={(event) => setProcessFilter(event.target.value)}
                    >
                      <option value="all">All processes</option>
                      {processes.map((process) => (
                        <option key={process.id} value={process.id}>
                          {process.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {view !== "tasks" && (
                  <div className={styles.tableTabs} aria-label="Case status">
                    <button
                      aria-pressed={attentionOnly}
                      className={attentionOnly ? styles.tabActive : ""}
                      onClick={() => setAttentionOnly(true)}
                    >
                      Needs attention <span>{attentionCount}</span>
                    </button>
                    <button
                      aria-pressed={!attentionOnly}
                      className={!attentionOnly ? styles.tabActive : ""}
                      onClick={() => setAttentionOnly(false)}
                    >
                      All sample cases <span>{cases.length}</span>
                    </button>
                  </div>
                )}
                <div className={styles.caseList}>
                  {filteredCases
                    .slice(0, view === "overview" ? 4 : undefined)
                    .map((item) => {
                      const process = processes.find(
                        (process) => process.id === item.processId,
                      )!;
                      return (
                        <button
                          key={item.id}
                          className={styles.caseRow}
                          onClick={() => openCase(item)}
                        >
                          <span
                            className={`${styles.caseStatus} ${!item.attention ? styles.caseHealthy : ""}`}
                          >
                            {item.attention ? (
                              <Clock3 size={17} />
                            ) : (
                              <Check size={17} />
                            )}
                          </span>
                          <span className={styles.caseName}>
                            <strong>{item.name}</strong>
                            <small>
                              {process.name} <span>·</span> {item.id}
                            </small>
                          </span>
                          <span className={styles.caseDetail}>
                            <span>{item.reason}</span>
                            <small
                              className={
                                item.due.includes("overdue") && item.attention
                                  ? styles.overdue
                                  : ""
                              }
                            >
                              {item.attention ? item.due : "On track"}
                              {item.mine && item.attention
                                ? " · Assigned to you"
                                : ""}
                            </small>
                          </span>
                          <ChevronRight size={16} />
                        </button>
                      );
                    })}
                  {filteredCases.length === 0 && (
                    <div className={styles.emptyState}>
                      <CheckCheck size={26} />
                      <h3>
                        {view === "tasks" && !query
                          ? "You're all caught up."
                          : "No matching cases."}
                      </h3>
                      <p>
                        {view === "tasks" && !query
                          ? "Your sample tasks are complete. See the next stages in Processes."
                          : "Try a different search, process, or status filter."}
                      </p>
                      <button
                        className={styles.textButton}
                        onClick={() => {
                          setQuery("");
                          setProcessFilter("all");
                          setAttentionOnly(false);
                          if (view === "tasks") setView("processes");
                        }}
                      >
                        See all sample cases <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className={styles.tableFooter}>
                  <span>
                    Showing{" "}
                    {Math.min(
                      filteredCases.length,
                      view === "overview" ? 4 : filteredCases.length,
                    )}{" "}
                    of {filteredCases.length} sample cases
                  </span>
                  {view === "overview" && (
                    <button
                      className={styles.textButton}
                      onClick={() => navigate("tasks")}
                    >
                      My tasks <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </section>
              {view === "overview" && <ActivityChart compact />}
            </div>
          )}

          {view === "insights" && (
            <div className={styles.insightsGrid}>
              <ActivityChart />
              <section className={styles.panel}>
                <div className={styles.sectionHeading}>
                  <div>
                    <span className={styles.eyebrow}>
                      TIME THAT MEANS SOMETHING
                    </span>
                    <h2>Average turnaround</h2>
                    <p>From the first step to the last, in business terms.</p>
                  </div>
                </div>
                <div className={styles.turnarounds}>
                  {processes.map((process) => (
                    <div key={process.id}>
                      <ProcessIcon process={process} />
                      <div>
                        <strong>{process.name}</strong>
                        <span>End-to-end process time</span>
                      </div>
                      <b>
                        {process.id === "onboarding" && period === "30"
                          ? "2.7 days"
                          : process.turnaround}
                      </b>
                    </div>
                  ))}
                </div>
                <p className={styles.insightNote}>
                  Metrics are illustrative. The source, time window, and stage
                  definitions will be agreed with the team.
                </p>
              </section>
            </div>
          )}
          <footer className={styles.pageFooter}>
            <span>
              <span className={styles.dot} /> Fictional data. Real
              possibilities.
            </span>
            <button onClick={() => setNotesOpen(true)}>
              Built for the conversation <ArrowUpRight size={13} />
            </button>
          </footer>
          <p className={styles.announcement} role="status">
            {announcement}
            {announcement && (
              <button
                aria-label="Dismiss update"
                onClick={() => setAnnouncement("")}
              >
                <X size={15} />
              </button>
            )}
          </p>
        </main>
      </div>

      <dialog
        ref={dialog}
        className={`${styles.dialog} ${notesOpen ? styles.notesDialog : ""}`}
        onCancel={closeDialog}
        onClose={closeDialog}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        aria-labelledby="preview-dialog-title"
      >
        <div className={styles.dialogBody}>
          {notesOpen ? (
            <>
              <div className={styles.dialogHeader}>
                <span className={styles.previewBadge}>
                  DESIGN EXPLORATION / 01
                </span>
                <button
                  autoFocus
                  className={styles.iconButton}
                  onClick={closeDialog}
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>
              </div>
              <h2 id="preview-dialog-title">
                Let's start with a clearer view.
              </h2>
              <p>
                This home page explores the October 26 Business Console
                discussion: one place for business people to understand
                processes, see meaningful metrics, and take their next human
                step.
              </p>
              <div className={styles.notesList}>
                <h3>Try it</h3>
                <p>
                  Filter a process. Search for a case. Open a case to follow its
                  stages, business data, and history. Visit My tasks to complete
                  a sample review.
                </p>
                <h3>Questions for the team</h3>
                <ul>
                  <li>
                    What should a manager see first: exceptions, assigned work,
                    or process health?
                  </li>
                  <li>
                    Which stages and metrics make sense for each business
                    process?
                  </li>
                  <li>What should each role see and act on?</li>
                  <li>
                    Where should forms, people, and future templates live?
                  </li>
                </ul>
                <h3>Scope of this concept</h3>
                <p>
                  All names, counts, charts, and cases are fictional. Actions
                  update this browser session and reset on reload. Forms and
                  access management are navigation ideas; workflow creation and
                  backend integration are future work.
                </p>
              </div>
            </>
          ) : (
            selectedCase &&
            selectedProcess && (
              <>
                <div className={styles.dialogHeader}>
                  <span className={styles.eyebrow}>
                    PROCESS CASE / {selectedCase.id}
                  </span>
                  <button
                    autoFocus
                    className={styles.iconButton}
                    aria-label="Close case details"
                    onClick={closeDialog}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className={styles.caseTitle}>
                  <ProcessIcon process={selectedProcess} />
                  <div>
                    <p>{selectedProcess.name}</p>
                    <h2 id="preview-dialog-title">{selectedCase.name}</h2>
                  </div>
                </div>
                <span
                  className={`${styles.statusPill} ${!selectedCase.attention ? styles.healthyPill : ""}`}
                >
                  <span />
                  {selectedCase.attention ? "Needs attention" : "In progress"}
                </span>
                <h3 className={styles.drawerSectionTitle}>
                  Every step, in plain sight.
                </h3>
                <ol className={styles.stageTracker}>
                  {selectedProcess.stages.map((stage, index) => (
                    <li
                      key={stage}
                      className={
                        index < selectedCase.stage
                          ? styles.stageDone
                          : index === selectedCase.stage
                            ? styles.stageCurrent
                            : ""
                      }
                    >
                      <span>
                        {index < selectedCase.stage ? (
                          <Check size={15} />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <div>
                        <strong>{stage}</strong>
                        <small>
                          {index < selectedCase.stage
                            ? "Completed"
                            : index === selectedCase.stage
                              ? selectedCase.reason
                              : "Up next"}
                        </small>
                      </div>
                      {index === selectedCase.stage && (
                        <span className={styles.currentLabel}>Current</span>
                      )}
                    </li>
                  ))}
                </ol>
                <h3 className={styles.drawerSectionTitle}>Business details</h3>
                <dl className={styles.businessDetails}>
                  <div>
                    <dt>Case reference</dt>
                    <dd>{selectedCase.id}</dd>
                  </div>
                  <div>
                    <dt>Customer / request</dt>
                    <dd>{selectedCase.name}</dd>
                  </div>
                  <div>
                    <dt>Responsible person</dt>
                    <dd>{selectedCase.owner}</dd>
                  </div>
                  <div>
                    <dt>Target</dt>
                    <dd>
                      {selectedCase.attention ? selectedCase.due : "On track"}
                    </dd>
                  </div>
                </dl>
                {selectedCase.mine && selectedCase.attention && (
                  <form className={styles.taskForm} onSubmit={completeTask}>
                    <h3>Your review is the next step.</h3>
                    <p>Try a task form connected to this process.</p>
                    <label>
                      Decision
                      <select
                        value={decision}
                        onChange={(event) => setDecision(event.target.value)}
                      >
                        <option value="approve">Approve and continue</option>
                        <option value="request-changes">Request changes</option>
                      </select>
                    </label>
                    <label>
                      Review note
                      <textarea
                        ref={taskNotes}
                        onInput={(event) =>
                          event.currentTarget.setCustomValidity("")
                        }
                        key={selectedCase.id}
                        required
                        maxLength={500}
                        placeholder="Add a short note for the team…"
                      />
                    </label>
                    <button type="submit" className={styles.primaryButton}>
                      {decision === "approve"
                        ? "Complete sample task"
                        : "Request sample changes"}
                      <ArrowRight size={15} />
                    </button>
                    <small>Demo only · No workflow will be changed.</small>
                  </form>
                )}
                <h3 className={styles.drawerSectionTitle}>Recent activity</h3>
                <div className={styles.timeline}>
                  {(caseActivity[selectedCase.id] || []).map((event, index) => (
                    <div key={index}>
                      <span />
                      <p>
                        <strong>{event.action}</strong>
                        <small>Just now · {event.note}</small>
                      </p>
                    </div>
                  ))}
                  {completedIds.current.has(selectedCase.id) && (
                    <div>
                      <span />
                      <p>
                        <strong>Review completed by Alex Morgan</strong>
                        <small>
                          Just now · Moved to{" "}
                          {selectedProcess.stages[selectedCase.stage]}
                        </small>
                      </p>
                    </div>
                  )}
                  <div>
                    <span />
                    <p>
                      <strong>
                        {
                          selectedProcess.stages[
                            Math.max(
                              selectedCase.stage -
                                (completedIds.current.has(selectedCase.id)
                                  ? 1
                                  : 0),
                              0,
                            )
                          ]
                        }{" "}
                        started
                      </strong>
                      <small>Oct 26, 2026 · 9:42 AM</small>
                    </p>
                  </div>
                  <div>
                    <span />
                    <p>
                      <strong>Process started</strong>
                      <small>Oct 25, 2026 · 2:18 PM</small>
                    </p>
                  </div>
                </div>
                <p className={styles.insightNote}>
                  Illustrative business data and event history.
                </p>
              </>
            )
          )}
        </div>
      </dialog>
    </div>
  );
}
