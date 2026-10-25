
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const initialGoals = [
  {
    id: 1,
    title: "Build a React project",
    tech: "React",
    deadline: "",
    done: false
  },
  {
    id: 2,
    title: "Practice JavaScript problems",
    tech: "JavaScript",
    deadline: "",
    done: false
  }
];

const initialTasks = [
  {
    id: 3,
    title: "Review array methods",
    tech: "JavaScript",
    done: false
  },
  {
    id: 4,
    title: "Build a reusable component",
    tech: "React",
    done: false
  }
];

const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function loadData(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function ProgressRing({ value, label, color = "#a78bfa" }) {
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="ring-wrap">
      <svg viewBox="0 0 110 110" className="progress-ring">
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="#292b43"
          strokeWidth="9"
        />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
          className="ring-progress"
        />
        <text
          x="55"
          y="53"
          textAnchor="middle"
          className="ring-value"
        >
          {value}%
        </text>
        <text
          x="55"
          y="68"
          textAnchor="middle"
          className="ring-caption"
        >
          DONE
        </text>
      </svg>
      <span className="ring-label">{label}</span>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const [goals, setGoals] = useState(
    () => loadData("lumora-goals", initialGoals)
  );
  const [tasks, setTasks] = useState(
    () => loadData("lumora-tasks", initialTasks)
  );
  const [activity, setActivity] = useState(
    () => loadData("lumora-activity", {})
  );

  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTech, setGoalTech] = useState("React");
  const [deadline, setDeadline] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTech, setTaskTech] = useState("JavaScript");
  const [seconds, setSeconds] = useState(1500);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    localStorage.setItem("lumora-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("lumora-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("lumora-activity", JSON.stringify(activity));
  }, [activity]);

  useEffect(() => {
    if (!timerRunning) return;

    const timer = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setTimerRunning(false);
          setSessionComplete(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerRunning]);

  const completedGoals = goals.filter((item) => item.done).length;
  const completedTasks = tasks.filter((item) => item.done).length;

  const goalProgress = goals.length
    ? Math.round((completedGoals / goals.length) * 100)
    : 0;

  const taskProgress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const totalItems = goals.length + tasks.length;
  const completedItems = completedGoals + completedTasks;
  const progress = totalItems
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    const key = dateKey(date);

    return {
      key,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      count: Number(activity[key]) || 0,
      today: key === todayKey()
    };
  });

  const maxActivity = Math.max(1, ...weekDays.map((day) => day.count));
  const weeklyTotal = weekDays.reduce((sum, day) => sum + day.count, 0);

  let streak = 0;
  const streakDate = new Date();
  streakDate.setHours(12, 0, 0, 0);

  // A streak includes today or yesterday, allowing progress
  // to remain visible earlier in the day before a new task is done.
  if ((Number(activity[todayKey()]) || 0) === 0) {
    streakDate.setDate(streakDate.getDate() - 1);
  }

  while (Number(activity[dateKey(streakDate)]) > 0) {
    streak += 1;
    streakDate.setDate(streakDate.getDate() - 1);
  }

  function recordActivity() {
    const key = todayKey();

    setActivity((current) => ({
      ...current,
      [key]: (Number(current[key]) || 0) + 1
    }));
  }

  function addGoal(event) {
    event.preventDefault();
    if (!goalTitle.trim()) return;

    setGoals((current) => [
      ...current,
      {
        id: Date.now(),
        title: goalTitle.trim(),
        tech: goalTech,
        deadline,
        done: false
      }
    ]);

    setGoalTitle("");
    setDeadline("");
  }

  function addTask(event) {
    event.preventDefault();
    if (!taskTitle.trim()) return;

    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        title: taskTitle.trim(),
        tech: taskTech,
        done: false
      }
    ]);

    setTaskTitle("");
  }

  function toggleGoal(id) {
    const target = goals.find((goal) => goal.id === id);
    if (!target) return;

    if (!target.done) recordActivity();

    setGoals((current) =>
      current.map((goal) =>
        goal.id === id ? { ...goal, done: !goal.done } : goal
      )
    );
  }

  function toggleTask(id) {
    const target = tasks.find((task) => task.id === id);
    if (!target) return;

    if (!target.done) recordActivity();

    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function resetTimer() {
    setTimerRunning(false);
    setSeconds(1500);
    setSessionComplete(false);
  }

  function formatTime(value) {
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  }

  function handleTimer() {
    if (sessionComplete) {
      resetTimer();
      return;
    }

    if (timerRunning) {
      setTimerRunning(false);
      return;
    }

    if (seconds === 0) {
      setSeconds(1500);
      setSessionComplete(false);
    }

    setTimerRunning(true);
  }

  const navItems = [
    { id: "dashboard", icon: "◈", label: "Overview" },
    { id: "goals", icon: "◎", label: "Coding Goals" },
    { id: "analytics", icon: "▥", label: "Analytics" },
    { id: "tasks", icon: "</>", label: "Daily Tasks" }
  ];

  function navigateTab(tab) {
    setActiveTab(tab);

    if (window.innerWidth <= 760) {
      setCollapsed(true);
    }
  }

  return (
    <div className={`dev-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="dev-sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">L</span>
          {!collapsed && (
            <span className="sidebar-brand-name">
              lumora<span>.</span>
            </span>
          )}
          <button
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        {!collapsed && <p className="sidebar-caption">WORKSPACE</p>}

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              title={collapsed ? item.label : ""}
              className={`nav-item ${activeTab === item.id ? "selected" : ""}`}
              onClick={() => navigateTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && activeTab === item.id && (
                <span className="nav-indicator" />
              )}
            </button>
          ))}
        </nav>

        {!collapsed && (
          <div className="sidebar-bottom">
            <div className="sidebar-mini-card">
              <span className="mini-card-icon">⌘</span>
              <strong>Keep building.</strong>
              <p>One task at a time.</p>
              <div className="mini-card-line" />
            </div>

            <div className="sidebar-profile">
              <div className="profile-avatar">
                {(user?.name || "D").charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <strong>{user?.name || "Developer"}</strong>
                <span>Developer workspace</span>
              </div>
              <button
                className="profile-logout"
                onClick={() => navigate("/", { replace: true })}
                title="Log out"
              >
                ↗
              </button>
            </div>
          </div>
        )}

        {collapsed && (
          <button
            className="collapsed-logout"
            title="Log out"
            onClick={() => navigate("/", { replace: true })}
          >
            ↗
          </button>
        )}
      </aside>

      <main className="dev-main">
        <div className="dev-topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>
              {navItems.find((item) => item.id === activeTab)?.label}
            </strong>
          </div>
          <div className="topbar-status">
            <span className="online-dot" />
            Your progress is saved locally
          </div>
        </div>

        <div className="dev-content">
          <div className="code-decoration code-decoration-one">
            {"{ }"}
          </div>
          <div className="code-decoration code-decoration-two">
            {"</>"}
          </div>

          {activeTab === "dashboard" && (
            <>
              <section className="dev-hero">
                <div className="hero-copy">
                  <div className="dev-eyebrow">
                    <span className="eyebrow-line" />
                    YOUR DEVELOPER WORKSPACE
                  </div>

                  <h1>
                    Build your next
                    <br />
                    <span>breakthrough.</span>
                  </h1>

                  <p>
                    Welcome back, {user?.name || "Developer"}.
                    Your next big idea starts with today's small steps.
                  </p>

                  <button
                    className="hero-button"
                    onClick={() => navigateTab("tasks")}
                  >
                    Continue coding <span>↗</span>
                  </button>
                </div>

                <div className="hero-art" aria-hidden="true">
                  <div className="hero-orbit orbit-one" />
                  <div className="hero-orbit orbit-two" />
                  <div className="hero-orbit orbit-three" />
                  <div className="hero-core">
                    <span>{"</>"}</span>
                  </div>
                  <span className="floating-code code-a">const build = true;</span>
                  <span className="floating-code code-b">npm run dev</span>
                  <span className="floating-spark spark-a">✳</span>
                  <span className="floating-spark spark-b">✦</span>
                </div>
              </section>

              <section className="dev-stats-grid">
                <div className="dev-stat">
                  <div className="stat-icon purple-icon">◎</div>
                  <span>Active goals</span>
                  <strong>{goals.filter((goal) => !goal.done).length}</strong>
                  <small>Keep your targets in sight</small>
                </div>

                <div className="dev-stat">
                  <div className="stat-icon cyan-icon">✓</div>
                  <span>Completed items</span>
                  <strong>{completedItems}</strong>
                  <small>Goals and tasks completed</small>
                </div>

                <div className="dev-stat streak-stat">
                  <div className="stat-icon orange-icon">ϟ</div>
                  <span>Coding streak</span>
                  <strong>{streak} <small>days</small></strong>
                  <small>Consecutive active days</small>
                </div>

                <div className="dev-stat">
                  <div className="stat-icon pink-icon">↗</div>
                  <span>Weekly activity</span>
                  <strong>{weeklyTotal}</strong>
                  <small>Items completed this week</small>
                </div>
              </section>

              <section className="dev-panel-grid">
                <div className="dev-panel rings-panel">
                  <div className="dev-panel-heading">
                    <div>
                      <span className="panel-kicker">YOUR JOURNEY</span>
                      <h2>Progress overview</h2>
                    </div>
                    <span className="live-badge">LIVE</span>
                  </div>

                  <div className="rings-container">
                    <ProgressRing
                      value={progress}
                      label="Overall"
                      color="#a78bfa"
                    />
                    <ProgressRing
                      value={goalProgress}
                      label="Goals"
                      color="#54d8f2"
                    />
                    <ProgressRing
                      value={taskProgress}
                      label="Tasks"
                      color="#f0a5ff"
                    />
                  </div>

                  <div className="ring-legend">
                    <span><i className="legend-purple" /> Overall</span>
                    <span><i className="legend-cyan" /> Goals</span>
                    <span><i className="legend-pink" /> Tasks</span>
                  </div>
                </div>

                <div className="dev-panel streak-panel">
                  <div className="dev-panel-heading">
                    <div>
                      <span className="panel-kicker">STAY CONSISTENT</span>
                      <h2>Your coding streak</h2>
                    </div>
                    <span className="streak-flame">ϟ</span>
                  </div>

                  <div className="streak-number">
                    {String(streak).padStart(2, "0")}
                    <span>days</span>
                  </div>

                  <p className="streak-description">
                    {streak > 0
                      ? "You're building a habit. Keep the momentum going!"
                      : "Complete a goal or coding task to start your streak."}
                  </p>

                  <div className="streak-week">
                    {weekDays.map((day) => (
                      <div className="streak-day" key={day.key}>
                        <div
                          className={`streak-day-dot ${
                            day.count > 0 ? "day-active" : ""
                          } ${day.today ? "day-today" : ""}`}
                        >
                          {day.count > 0 ? "✓" : "·"}
                        </div>
                        <span>{day.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="dev-panel activity-panel">
                <div className="dev-panel-heading">
                  <div>
                    <span className="panel-kicker">CONSISTENCY MATTERS</span>
                    <h2>Weekly coding activity</h2>
                    <p className="panel-subtitle">
                      Completed goals and tasks, day by day.
                    </p>
                  </div>
                  <span className="activity-total">{weeklyTotal} completed</span>
                </div>

                <div className="activity-chart">
                  {weekDays.map((day) => (
                    <div className="chart-column" key={day.key}>
                      <span className="chart-count">{day.count}</span>
                      <div className="chart-bar-track">
                        <div
                          className={`chart-bar ${day.today ? "chart-today" : ""}`}
                          style={{
                            height: `${Math.max(
                              day.count > 0 ? 12 : 4,
                              (day.count / maxActivity) * 100
                            )}%`
                          }}
                        />
                      </div>
                      <span className={day.today ? "chart-label today-label" : "chart-label"}>
                        {day.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="dev-panel quick-panel">
                <div className="dev-panel-heading">
                  <div>
                    <span className="panel-kicker">YOUR NEXT STEP</span>
                    <h2>Pick up where you left off</h2>
                  </div>
                </div>

                <div className="quick-actions">
                  <button onClick={() => navigateTab("goals")}>
                    <span className="quick-icon purple-icon">◎</span>
                    <span>
                      <strong>Coding goals</strong>
                      <small>{goals.filter((goal) => !goal.done).length} remaining</small>
                    </span>
                    <span className="quick-arrow">↗</span>
                  </button>

                  <button onClick={() => navigateTab("tasks")}>
                    <span className="quick-icon cyan-icon">{"</>"}</span>
                    <span>
                      <strong>Daily coding</strong>
                      <small>{tasks.filter((task) => !task.done).length} tasks left</small>
                    </span>
                    <span className="quick-arrow">↗</span>
                  </button>

                  <button onClick={() => navigateTab("analytics")}>
                    <span className="quick-icon pink-icon">▥</span>
                    <span>
                      <strong>Analytics</strong>
                      <small>Review your progress</small>
                    </span>
                    <span className="quick-arrow">↗</span>
                  </button>
                </div>
              </section>
            </>
          )}

          {activeTab === "goals" && (
            <section className="dev-panel detail-panel">
              <div className="dev-panel-heading">
                <div>
                  <span className="panel-kicker">PLAN YOUR GROWTH</span>
                  <h2>Coding goals</h2>
                  <p className="panel-subtitle">Turn your ideas into achievable milestones.</p>
                </div>
                <span className="activity-total">{goals.length} total</span>
              </div>

              <form className="add-form" onSubmit={addGoal}>
                <input
                  placeholder="e.g. Build a full-stack application"
                  aria-label="Goal title"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  required
                />
                <select
                  aria-label="Goal technology"
                  value={goalTech}
                  onChange={(e) => setGoalTech(e.target.value)}
                >
                  <option>React</option>
                  <option>JavaScript</option>
                  <option>Node.js</option>
                  <option>Express</option>
                  <option>MongoDB</option>
                  <option>HTML/CSS</option>
                  <option>Other</option>
                </select>
                <input
                  type="date"
                  aria-label="Deadline"
                  min={todayKey()}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
                <button className="hero-button" type="submit">+ Add goal</button>
              </form>

              <div className="detail-list">
                {goals.map((goal) => (
                  <div className="detail-item" key={goal.id}>
                    <input
                      type="checkbox"
                      checked={goal.done}
                      onChange={() => toggleGoal(goal.id)}
                      aria-label={`Complete ${goal.title}`}
                    />
                    <div className="detail-item-copy">
                      <strong className={goal.done ? "item-done" : ""}>{goal.title}</strong>
                      <span>{goal.tech}{goal.deadline ? ` · Due ${goal.deadline}` : ""}</span>
                    </div>
                    <span className={`detail-status ${goal.done ? "status-done" : ""}`}>
                      {goal.done ? "Completed" : "In progress"}
                    </span>
                  </div>
                ))}
                {!goals.length && <p className="empty-state">Add your first coding goal above.</p>}
              </div>
            </section>
          )}

          {activeTab === "analytics" && (
            <>
              <section className="dev-panel detail-panel">
                <div className="dev-panel-heading">
                  <div>
                    <span className="panel-kicker">YOUR DEVELOPER JOURNEY</span>
                    <h2>Progress analytics</h2>
                    <p className="panel-subtitle">A snapshot of your completed work.</p>
                  </div>
                </div>

                <div className="analytics-rings">
                  <ProgressRing value={progress} label="Overall" color="#a78bfa" />
                  <ProgressRing value={goalProgress} label="Goals" color="#54d8f2" />
                  <ProgressRing value={taskProgress} label="Tasks" color="#f0a5ff" />
                </div>

                <div className="analytics-summary">
                  <div><span>Total items</span><strong>{totalItems}</strong></div>
                  <div><span>Completed</span><strong>{completedItems}</strong></div>
                  <div><span>Remaining</span><strong>{totalItems - completedItems}</strong></div>
                  <div><span>Current streak</span><strong>{streak} days</strong></div>
                </div>
              </section>

              <section className="dev-panel activity-panel">
                <div className="dev-panel-heading">
                  <div>
                    <span className="panel-kicker">LAST SEVEN DAYS</span>
                    <h2>Weekly coding activity</h2>
                  </div>
                  <span className="activity-total">{weeklyTotal} completed</span>
                </div>

                <div className="activity-chart">
                  {weekDays.map((day) => (
                    <div className="chart-column" key={day.key}>
                      <span className="chart-count">{day.count}</span>
                      <div className="chart-bar-track">
                        <div
                          className={`chart-bar ${day.today ? "chart-today" : ""}`}
                          style={{ height: `${Math.max(day.count ? 12 : 4, day.count / maxActivity * 100)}%` }}
                        />
                      </div>
                      <span className="chart-label">{day.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === "tasks" && (
            <section className="dev-panel detail-panel">
              <div className="dev-panel-heading">
                <div>
                  <span className="panel-kicker">SHOW UP AND PRACTISE</span>
                  <h2>Daily coding tasks</h2>
                  <p className="panel-subtitle">Make progress one task at a time.</p>
                </div>
                <span className="activity-total">{completedTasks}/{tasks.length} done</span>
              </div>

              <form className="add-form" onSubmit={addTask}>
                <input
                  placeholder="e.g. Practise array methods"
                  aria-label="Task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
                <select
                  aria-label="Task technology"
                  value={taskTech}
                  onChange={(e) => setTaskTech(e.target.value)}
                >
                  <option>JavaScript</option>
                  <option>React</option>
                  <option>Node.js</option>
                  <option>Express</option>
                  <option>MongoDB</option>
                  <option>HTML/CSS</option>
                  <option>Other</option>
                </select>
                <button className="hero-button" type="submit">+ Add task</button>
              </form>

              <div className="detail-list">
                {tasks.map((task) => (
                  <div className="detail-item" key={task.id}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      aria-label={`Complete ${task.title}`}
                    />
                    <div className="detail-item-copy">
                      <strong className={task.done ? "item-done" : ""}>{task.title}</strong>
                      <span>{task.tech}</span>
                    </div>
                    <span className={`detail-status ${task.done ? "status-done" : ""}`}>
                      {task.done ? "Completed" : "To do"}
                    </span>
                  </div>
                ))}
                {!tasks.length && <p className="empty-state">Add a coding task to get started.</p>}
              </div>

              <div className="focus-card">
                <div>
                  <span className="panel-kicker">DEEP WORK MODE</span>
                  <h3>{formatTime(seconds)}</h3>
                  <p>
                    {sessionComplete
                      ? "Session complete. Great work!"
                      : "Focus on one task. Ignore the distractions."}
                  </p>
                </div>
                <div className="timer-actions">
                  <button className="hero-button" onClick={handleTimer}>
                    {sessionComplete ? "Start again" : timerRunning ? "Pause" : "Start focus"}
                  </button>
                  <button className="secondary-button" onClick={resetTimer}>Reset</button>
                </div>
              </div>
            </section>
          )}

          <footer className="dev-footer">
            <span><i className="online-dot" /> BUILT FOR YOUR NEXT BREAKTHROUGH</span>
            <span>Less scrolling. More shipping. ✦</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
