export const AVATAR_COLORS = [
  '#5B5BFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#14B8A6',
];

export const STATUSES = {
  backlog:   { label: 'Backlog',     cls: 'oc-chip--closed',   dot: 'var(--s-closed-500)' },
  open:      { label: 'Open',        cls: 'oc-chip--open',     dot: 'var(--s-open-500)' },
  progress:  { label: 'In progress', cls: 'oc-chip--progress', dot: 'var(--s-progress-500)' },
  review:    { label: 'In review',   cls: 'oc-chip--review',   dot: 'var(--s-review-500)' },
  merged:    { label: 'Merged',      cls: 'oc-chip--merged',   dot: 'var(--s-merged-500)' },
  blocked:   { label: 'Blocked',     cls: 'oc-chip--blocked',  dot: 'var(--s-blocked-500)' },
  done:      { label: 'Done',        cls: 'oc-chip--merged',   dot: 'var(--s-merged-500)' },
};

export const WORKSPACE = {
  name: 'Orbital',
  members: ['Maya Chen', 'Dev Patel', 'Rae Wong', 'Jonas Becker', 'Priya Kapoor', 'Alex Kim', 'Sam Rivera', 'Noor Hassan', 'Theo Lin', 'Izzy Park'],
  spaces: [
    { id: 'eng',    name: 'Engineering', icon: 'terminal',    color: '#5B5BFF' },
    { id: 'design', name: 'Design',      icon: 'palette',     color: '#EC4899' },
    { id: 'ops',    name: 'Ops',         icon: 'activity',    color: '#10B981' },
    { id: 'growth', name: 'Growth',      icon: 'trending-up', color: '#F59E0B' },
  ],
};

export const PROJECT = {
  space: 'Engineering',
  name: 'Runtime · v0.8',
  lists: ['Sprint 24', 'Backlog', 'Bugs', 'Research'],
  activeList: 'Sprint 24',
  progress: 0.62,
};

export const VIEWS = [
  { id: 'board',    label: 'Board',    icon: 'kanban' },
  { id: 'list',     label: 'List',     icon: 'list' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'gantt',    label: 'Timeline', icon: 'gantt-chart' },
];

// Helper: generate stub subtasks from checks [done, total]
function mkSubtasks(checks, titles = []) {
  const total = checks[1];
  const done  = checks[0];
  return Array.from({ length: total }, (_, i) => ({
    id: `st-${i}`,
    title: titles[i] || `Subtask ${i + 1}`,
    done: i < done,
  }));
}

export const TASKS = [
  {
    id: 'ORB-412', title: 'Rewrite scheduler core with priority queues',
    status: 'progress', priority: 'urgent',
    assignees: ['Maya Chen', 'Dev Patel'], due: 'Apr 28',
    branch: 'feat/scheduler-core', pr: { id: 1184, state: 'open' },
    comments: 14, checks: [4, 7], tags: ['perf', 'runtime'],
    subtasks: mkSubtasks([4, 7], [
      'Design priority queue interface', 'Implement min-heap', 'Benchmark vs current FIFO',
      'Write integration tests', 'Update scheduler docs', 'Load-test with 10k jobs', 'Ship behind feature flag',
    ]),
    commentThread: [],
  },
  {
    id: 'ORB-418', title: 'Retry policy on transient network failures',
    status: 'review', priority: 'high',
    assignees: ['Rae Wong'], due: 'Apr 25',
    branch: 'fix/retry-transient', pr: { id: 1189, state: 'open' },
    comments: 6, checks: [3, 3], tags: ['resilience'],
    subtasks: mkSubtasks([3, 3], ['Add exponential backoff', 'Handle idempotency tokens', 'Add chaos test']),
    commentThread: [],
  },
  {
    id: 'ORB-421', title: 'Webhook signature verification (HMAC-SHA256)',
    status: 'open', priority: 'high',
    assignees: ['Jonas Becker'], due: 'May 02',
    branch: null, pr: null,
    comments: 2, checks: [0, 4], tags: ['security'],
    subtasks: mkSubtasks([0, 4], ['Design signature scheme', 'Implement HMAC-SHA256', 'Add replay protection', 'Update webhook docs']),
    commentThread: [],
  },
  {
    id: 'ORB-407', title: 'Migrate metrics pipeline to OpenTelemetry',
    status: 'progress', priority: 'normal',
    assignees: ['Priya Kapoor', 'Alex Kim'], due: 'May 08',
    branch: 'chore/otel-migration', pr: { id: 1176, state: 'draft' },
    comments: 22, checks: [6, 11], tags: ['observability', 'infra'],
    subtasks: mkSubtasks([6, 11], [
      'Audit current metrics', 'Install OTEL SDK', 'Migrate counters', 'Migrate histograms',
      'Migrate traces', 'Update dashboards', 'Remove old Prometheus client',
      'Load test OTEL pipeline', 'Update runbook', 'Enable sampling', 'Ship to prod',
    ]),
    commentThread: [],
  },
  {
    id: 'ORB-430', title: 'Dark mode token audit in dashboard',
    status: 'open', priority: 'normal',
    assignees: ['Sam Rivera'], due: 'May 05',
    branch: null, pr: null,
    comments: 0, checks: [0, 6], tags: ['design', 'a11y'],
    subtasks: mkSubtasks([0, 6], [
      'Audit sidebar tokens', 'Audit topbar tokens', 'Audit cards', 'Check contrast ratios',
      'Fix failing tokens', 'Test in both themes',
    ]),
    commentThread: [],
  },
  {
    id: 'ORB-399', title: 'Flaky test: `runtime/worker_pool_test.go::TestDrain`',
    status: 'blocked', priority: 'high',
    assignees: ['Dev Patel'], due: 'Apr 24',
    branch: 'test/flake-worker-pool', pr: null,
    comments: 9, checks: [1, 3], tags: ['test', 'flaky'],
    subtasks: mkSubtasks([1, 3], ['Reproduce flake locally', 'Identify race condition', 'Fix and add regression test']),
    commentThread: [],
  },
  {
    id: 'ORB-425', title: 'Index pgstore on (tenant, created_at) composite',
    status: 'merged', priority: 'normal',
    assignees: ['Noor Hassan'], due: 'Apr 22',
    branch: 'db/pgstore-composite-idx', pr: { id: 1171, state: 'merged' },
    comments: 4, checks: [3, 3], tags: ['db', 'perf'],
    subtasks: mkSubtasks([3, 3], ['Write migration', 'Benchmark query plan', 'Deploy to staging']),
    commentThread: [],
  },
  {
    id: 'ORB-434', title: 'CLI: `orbital deploy --dry-run` prints diff',
    status: 'open', priority: 'low',
    assignees: ['Theo Lin'], due: 'May 12',
    branch: null, pr: null,
    comments: 1, checks: [0, 5], tags: ['cli', 'dx'],
    subtasks: mkSubtasks([0, 5], ['Design diff format', 'Implement --dry-run flag', 'Add color output', 'Write tests', 'Update CLI docs']),
    commentThread: [],
  },
  {
    id: 'ORB-440', title: 'Support SSO via SAML for Enterprise plan',
    status: 'open', priority: 'urgent',
    assignees: ['Izzy Park', 'Maya Chen'], due: 'May 15',
    branch: null, pr: null,
    comments: 3, checks: [0, 9], tags: ['auth', 'enterprise'],
    subtasks: mkSubtasks([0, 9], [
      'Evaluate SAML libraries', 'Design IdP integration flow', 'Build SP metadata endpoint',
      'Implement ACS handler', 'Add attribute mapping', 'Build admin SAML config UI',
      'Write integration tests', 'Security review', 'Ship behind enterprise flag',
    ]),
    commentThread: [],
  },
  {
    id: 'ORB-414', title: 'Graceful shutdown of long-running jobs',
    status: 'progress', priority: 'high',
    assignees: ['Rae Wong'], due: 'Apr 30',
    branch: 'feat/graceful-shutdown', pr: { id: 1182, state: 'draft' },
    comments: 7, checks: [2, 5], tags: ['runtime'],
    subtasks: mkSubtasks([2, 5], [
      'Add SIGTERM handler', 'Drain job queue on shutdown',
      'Add shutdown timeout', 'Test with long jobs', 'Update ops runbook',
    ]),
    commentThread: [],
  },
  {
    id: 'ORB-428', title: 'Billing: prorated upgrades mid-cycle',
    status: 'review', priority: 'normal',
    assignees: ['Jonas Becker'], due: 'Apr 29',
    branch: 'feat/billing-proration', pr: { id: 1188, state: 'open' },
    comments: 11, checks: [4, 4], tags: ['billing'],
    subtasks: mkSubtasks([4, 4], ['Calculate proration formula', 'Implement upgrade flow', 'Add invoice line items', 'Write billing tests']),
    commentThread: [],
  },
  {
    id: 'ORB-442', title: 'Audit log export to S3 (CSV + JSONL)',
    status: 'open', priority: 'normal',
    assignees: ['Alex Kim'], due: 'May 18',
    branch: null, pr: null,
    comments: 0, checks: [0, 7], tags: ['compliance'],
    subtasks: mkSubtasks([0, 7], [
      'Design export schema', 'Implement CSV exporter', 'Implement JSONL exporter',
      'Add S3 upload', 'Add scheduled export job', 'Add admin UI trigger', 'Write tests',
    ]),
    commentThread: [],
  },
  {
    id: 'ORB-419', title: 'Investigate 500ms p99 spike in auth/verify',
    status: 'progress', priority: 'urgent',
    assignees: ['Priya Kapoor'], due: 'Apr 26',
    branch: 'perf/auth-verify-p99', pr: null,
    comments: 2, checks: [2, 4], tags: ['perf', 'auth', 'incident'],
    subtasks: [
      { id: 'st-0', title: 'Capture p99 flamegraph from prod us-east-1', done: true },
      { id: 'st-1', title: 'Add pprof endpoint to auth service', done: true },
      { id: 'st-2', title: 'Isolate sync Redis call, benchmark async alternative', done: false },
      { id: 'st-3', title: 'Deploy fix to staging shadow traffic for 48h', done: false },
    ],
    commentThread: [
      {
        id: '1', type: 'comment', author: 'Priya Kapoor', when: '3h ago',
        body: 'Pushed a first pass — moved the session lookup behind an async worker pool. Local bench shows p99 142ms → 68ms under load. Want @Dev Patel to sanity check before we ship to staging.',
      },
      {
        id: '2', type: 'event', author: 'Priya Kapoor', when: '2h ago',
        icon: 'git-commit-horizontal',
        body: 'pushed a3f8c21 to perf/auth-verify-p99',
      },
      {
        id: '3', type: 'event', author: 'CI', when: '2h ago',
        icon: 'check-circle-2', color: 'var(--s-merged-500)',
        body: 'CI passed for a3f8c21 · 8 / 8 checks green',
      },
      {
        id: '4', type: 'comment', author: 'Dev Patel', when: '1h ago',
        body: "Nice. One concern: cache warmup on cold-start could still tail. Let's pre-load the top 1% session IDs on boot. I'll open a follow-up.",
      },
    ],
  },
  {
    id: 'ORB-400', title: 'Documentation: upgrade guide for v0.8',
    status: 'progress', priority: 'normal',
    assignees: ['Theo Lin'], due: 'May 06',
    branch: 'docs/v0-8-upgrade', pr: { id: 1177, state: 'draft' },
    comments: 2, checks: [3, 8], tags: ['docs'],
    subtasks: mkSubtasks([3, 8], [
      'Draft migration checklist', 'Document breaking changes', 'Add upgrade examples',
      'Review with eng', 'Review with support', 'Add changelog entry', 'Publish to docs site', 'Tweet it',
    ]),
    commentThread: [],
  },
  {
    id: 'ORB-436', title: 'Kanban: drag handle obscured on compact density',
    status: 'open', priority: 'low',
    assignees: ['Sam Rivera'], due: 'May 20',
    branch: null, pr: null,
    comments: 0, checks: [0, 2], tags: ['ui', 'bug'],
    subtasks: mkSubtasks([0, 2], ['Reproduce in compact mode', 'Fix handle z-index']),
    commentThread: [],
  },
  {
    id: 'ORB-401', title: 'Switch bundler from webpack to Vite for dashboard',
    status: 'backlog', priority: 'low',
    assignees: ['Alex Kim'], due: '—',
    branch: null, pr: null,
    comments: 5, checks: [0, 6], tags: ['build', 'dx'],
    subtasks: mkSubtasks([0, 6], [
      'Benchmark build times', 'Set up Vite config', 'Migrate aliases',
      'Update HMR config', 'Test prod build', 'Update CI pipeline',
    ]),
    commentThread: [],
  },
];
