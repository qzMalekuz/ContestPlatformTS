import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

const storageKeys = {
  apiBase: "contest-platform-api-base",
  token: "contest-platform-token",
};

function getDefaultApiBase() {
  if (typeof window === "undefined") {
    return "/api";
  }

  return `${window.location.origin}/api`;
}

function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function toIsoLocal(value) {
  return new Date(value).toISOString();
}

function readForm(form) {
  return new FormData(form);
}

function App() {
  const [apiBase, setApiBase] = useState(
    () => localStorage.getItem(storageKeys.apiBase) || getDefaultApiBase(),
  );
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.token) || "");
  const [authMode, setAuthMode] = useState("login");
  const [health, setHealth] = useState({ label: "Checking API", tone: "pending" });
  const [consoleOutput, setConsoleOutput] = useState(
    "Welcome to Contest Platform. Sign in to load contests.",
  );
  const [contestList, setContestList] = useState([]);
  const [contestId, setContestId] = useState("");
  const [contestDetail, setContestDetail] = useState("");
  const [leaderboardOutput, setLeaderboardOutput] = useState("");
  const [creatingContest, setCreatingContest] = useState(false);
  const authRef = useRef(null);
  const dashboardRef = useRef(null);

  const payload = useMemo(() => decodeJwt(token), [token]);
  const isAuthenticated = Boolean(token);
  const isCreator = payload?.role === "creator";

  useEffect(() => {
    localStorage.setItem(storageKeys.apiBase, apiBase);
  }, [apiBase]);

  useEffect(() => {
    localStorage.setItem(storageKeys.token, token);
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const response = await fetch(`${apiBase}/health`);
        if (!response.ok) {
          throw new Error("API unavailable");
        }

        const data = await response.json();
        if (!cancelled) {
          setHealth({
            label: data?.data?.status === "ok" ? "API online" : "Connected",
            tone: "success",
          });
        }
      } catch {
        if (!cancelled) {
          setHealth({
            label: "API offline",
            tone: "error",
          });
        }
      }
    }

    checkHealth();

    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  useEffect(() => {
    if (!isAuthenticated) {
      setContestList([]);
      setContestDetail("");
      setLeaderboardOutput("");
      return;
    }

    loadContests();
  }, [isAuthenticated]);

  function logResult(label, payloadValue) {
    setConsoleOutput(`${label}\n${pretty(payloadValue)}`);
  }

  async function api(path, options = {}) {
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({
      success: false,
      data: null,
      error: "INVALID_JSON_RESPONSE",
    }));

    logResult(`${options.method || "GET"} ${path} -> ${response.status}`, data);

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  }

  async function runAction(action) {
    try {
      await action();
    } catch (error) {
      logResult("Request error", { message: error.message });
    }
  }

  async function loadContests() {
    await runAction(async () => {
      const result = await api("/contests");
      setContestList(result.data || []);
    });
  }

  function jumpToAuth() {
    authRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function jumpToDashboard() {
    dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function logout() {
    setToken("");
    setContestId("");
    setContestList([]);
    setContestDetail("");
    setLeaderboardOutput("");
    setCreatingContest(false);
    setAuthMode("login");
    logResult("Session cleared", { authenticated: false });
    jumpToAuth();
  }

  return (
    <>
      <div className="ambient-orb orb-one"></div>
      <div className="ambient-orb orb-two"></div>

      <div className="page-shell">
        <header className="site-nav">
          <a className="brandmark" href="#top">
            <span className="brandmark-badge">CP</span>
            <span>Contest Platform</span>
          </a>
          <nav className="nav-links">
            <a href="#top">Home</a>
            <a href="#auth">Auth</a>
            <a href="#dashboard">Contests</a>
          </nav>
          {isAuthenticated ? (
            <button className="nav-cta" onClick={jumpToDashboard} type="button">
              Go to contests
            </button>
          ) : (
            <button className="nav-cta" onClick={jumpToAuth} type="button">
              Sign in
            </button>
          )}
        </header>

        <section className="landing-hero" id="top">
          <div className="landing-copy">
            <p className="eyebrow">Basic Competition Flow</p>
            <h1>Land here, sign in, then enter the contests that fit your role.</h1>
            <p className="hero-text">
              This frontend now follows a simple journey: a landing page for first contact,
              an authentication step for signup and login, and a contest dashboard after sign-in.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <button className="button-link primary-link" onClick={jumpToDashboard} type="button">
                  Enter dashboard
                </button>
              ) : (
                <button className="button-link primary-link" onClick={jumpToAuth} type="button">
                  Start with login
                </button>
              )}
              <a className="button-link ghost-link" href="#features">
                See how it works
              </a>
            </div>
            <div className="hero-metrics">
              <article className="metric-card">
                <strong>1. Landing page</strong>
                <span>Users understand the platform before touching the app.</span>
              </article>
              <article className="metric-card">
                <strong>2. Signup / login</strong>
                <span>New users can register and existing users can sign in quickly.</span>
              </article>
              <article className="metric-card">
                <strong>3. Contest access</strong>
                <span>After authentication, contests load from the backend automatically.</span>
              </article>
            </div>
          </div>

          <aside className="hero-showcase">
            <div className="showcase-panel">
              <div className="showcase-topline">
                <p className="showcase-label">Session</p>
                <span className={`status-pill status-${health.tone}`}>{health.label}</span>
              </div>
              <div className="session-grid">
                <div className="session-chip">
                  <strong>Status</strong>
                  <span>{isAuthenticated ? "Authenticated" : "Guest"}</span>
                </div>
                <div className="session-chip">
                  <strong>Role</strong>
                  <span>{payload?.role || "not signed in"}</span>
                </div>
                <div className="session-chip">
                  <strong>API</strong>
                  <span>{apiBase}</span>
                </div>
                <div className="session-chip">
                  <strong>Contest Count</strong>
                  <span>{contestList.length}</span>
                </div>
              </div>
            </div>

            <div className="showcase-panel showcase-timeline">
              <p className="showcase-label">User Journey</p>
              <div className="timeline-item">
                <strong>Browse the platform</strong>
                <span>Users land on the homepage and understand the flow.</span>
              </div>
              <div className="timeline-item">
                <strong>Authenticate</strong>
                <span>Signup or login unlocks the protected contest routes.</span>
              </div>
              <div className="timeline-item">
                <strong>Use contests</strong>
                <span>Creators and contestees can then interact with contest data accordingly.</span>
              </div>
            </div>
          </aside>
        </section>

        <section className="feature-strip" id="features">
          <article className="feature-card">
            <p className="feature-kicker">Simple</p>
            <h2>Landing first, app second.</h2>
            <p>The public page stays focused on explanation and onboarding instead of exposing the full toolset immediately.</p>
          </article>
          <article className="feature-card">
            <p className="feature-kicker">Protected</p>
            <h2>Contests open after authentication.</h2>
            <p>Contest loading is tied to the backend token flow, so the dashboard feels like an actual signed-in area.</p>
          </article>
          <article className="feature-card">
            <p className="feature-kicker">Role-aware</p>
            <h2>Creators get creation tools, contestees get browsing tools.</h2>
            <p>The dashboard adapts after login and can expose creator actions only when the JWT role permits it.</p>
          </article>
        </section>

        <section className="auth-shell" id="auth" ref={authRef}>
          <div className="auth-copy">
            <p className="eyebrow">Authentication</p>
            <h2>Sign up or log in to unlock contests.</h2>
            <p>
              This section connects directly to your backend auth routes. After login,
              the token is stored locally and the contest dashboard is loaded.
            </p>
            <div className="config-inline">
              <label>
                <span>API base URL</span>
                <input
                  name="apiBase"
                  onChange={(event) => setApiBase(event.target.value.trim().replace(/\/$/, ""))}
                  placeholder={getDefaultApiBase()}
                  type="text"
                  value={apiBase}
                />
              </label>
            </div>
          </div>

          <div className="auth-card">
            <div className="auth-tabs">
              <button
                className={authMode === "login" ? "tab-button tab-active" : "tab-button"}
                onClick={() => setAuthMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={authMode === "signup" ? "tab-button tab-active" : "tab-button"}
                onClick={() => setAuthMode("signup")}
                type="button"
              >
                Signup
              </button>
            </div>

            {authMode === "login" ? (
              <form
                className="stack"
                onSubmit={(event) => {
                  event.preventDefault();
                  runAction(async () => {
                    const form = event.currentTarget;
                    const formData = readForm(form);
                    const result = await api("/auth/login", {
                      method: "POST",
                      body: JSON.stringify({
                        email: formData.get("email"),
                        password: formData.get("password"),
                      }),
                    });
                    setToken(result.data.token);
                    form.reset();
                    jumpToDashboard();
                  });
                }}
              >
                <label><span>Email</span><input name="email" required type="email" /></label>
                <label><span>Password</span><input name="password" required type="password" /></label>
                <button type="submit">Login and continue</button>
              </form>
            ) : (
              <form
                className="stack"
                onSubmit={(event) => {
                  event.preventDefault();
                  runAction(async () => {
                    const form = event.currentTarget;
                    const formData = readForm(form);
                    const result = await api("/auth/signup", {
                      method: "POST",
                      body: JSON.stringify({
                        name: formData.get("name"),
                        email: formData.get("email"),
                        password: formData.get("password"),
                        role: formData.get("role"),
                      }),
                    });
                    form.reset();
                    setAuthMode("login");
                    logResult("Signup success", result);
                  });
                }}
              >
                <label><span>Name</span><input name="name" required /></label>
                <label><span>Email</span><input name="email" required type="email" /></label>
                <label><span>Password</span><input name="password" required type="password" /></label>
                <label>
                  <span>Role</span>
                  <select defaultValue="contestee" name="role">
                    <option value="contestee">contestee</option>
                    <option value="creator">creator</option>
                  </select>
                </label>
                <button type="submit">Create account</button>
              </form>
            )}
          </div>
        </section>

        <section className="dashboard-shell" id="dashboard" ref={dashboardRef}>
          <div className="dashboard-head">
            <div>
              <p className="eyebrow">Contest Dashboard</p>
              <h2>{isAuthenticated ? "Your contest area" : "Sign in to access contests"}</h2>
              <p className="dashboard-subtext">
                {isAuthenticated
                  ? `Logged in as ${payload?.role || "user"}. Contests are loaded from the backend.`
                  : "Authentication is required before protected contest routes can be used."}
              </p>
            </div>
            {isAuthenticated ? (
              <div className="dashboard-actions">
                <button className="button-link ghost-link compact-link" onClick={loadContests} type="button">
                  Refresh contests
                </button>
                <button className="button-link ghost-link compact-link" onClick={logout} type="button">
                  Logout
                </button>
              </div>
            ) : null}
          </div>

          {!isAuthenticated ? (
            <div className="locked-panel">
              <strong>Dashboard locked</strong>
              <p>Signup or login first, then this section will load contest data automatically.</p>
              <button className="button-link primary-link" onClick={jumpToAuth} type="button">
                Go to authentication
              </button>
            </div>
          ) : (
            <div className="dashboard-grid">
              <section className="panel panel-wide">
                <div className="panel-heading">
                  <h2>Available contests</h2>
                  <p>These are fetched from `GET /api/contests` using your JWT.</p>
                </div>
                <div className="card-list">
                  {contestList.length ? (
                    contestList.map((contest) => (
                      <article
                        className={`contest-card contest-card-clickable${contestId === contest.id ? " contest-card-active" : ""}`}
                        key={contest.id}
                        onClick={() => setContestId(contest.id)}
                      >
                        <strong>{contest.title}</strong>
                        <div className="meta">{contest.description}</div>
                        <div className="meta-row">
                          <span>{contest.creatorName}</span>
                          <span>MCQs: {contest.mcqCount}</span>
                          <span>DSA: {contest.dsaCount}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <article className="contest-card">No contests found yet.</article>
                  )}
                </div>
              </section>

              <section className="panel">
                <div className="panel-heading">
                  <h2>Contest tools</h2>
                  <p>Pick a contest id, inspect details, and view the leaderboard.</p>
                </div>
                <div className="stack">
                  <label>
                    <span>Contest ID</span>
                    <input
                      onChange={(event) => setContestId(event.target.value)}
                      placeholder="Paste or click a contest id"
                      type="text"
                      value={contestId}
                    />
                  </label>
                  <div className="toolbar toolbar-two">
                    <button
                      onClick={() =>
                        runAction(async () => {
                          if (!contestId.trim()) {
                            throw new Error("Choose a contest first.");
                          }
                          const result = await api(`/contests/${contestId.trim()}`);
                          setContestDetail(pretty(result.data));
                        })
                      }
                      type="button"
                    >
                      Load details
                    </button>
                    <button
                      onClick={() =>
                        runAction(async () => {
                          if (!contestId.trim()) {
                            throw new Error("Choose a contest first.");
                          }
                          const result = await api(`/contests/${contestId.trim()}/leaderboard`);
                          setLeaderboardOutput(pretty(result.data));
                        })
                      }
                      type="button"
                    >
                      Load leaderboard
                    </button>
                  </div>
                </div>
              </section>

              {isCreator ? (
                <section className="panel">
                  <div className="panel-heading">
                    <h2>Creator tools</h2>
                    <p>Creators can publish contests after login.</p>
                  </div>
                  <button
                    className="button-link ghost-link inline-button"
                    onClick={() => setCreatingContest((value) => !value)}
                    type="button"
                  >
                    {creatingContest ? "Hide creator form" : "Create a contest"}
                  </button>
                  {creatingContest ? (
                    <form
                      className="stack"
                      onSubmit={(event) => {
                        event.preventDefault();
                        runAction(async () => {
                          const form = event.currentTarget;
                          const formData = readForm(form);
                          const result = await api("/contests", {
                            method: "POST",
                            body: JSON.stringify({
                              title: formData.get("title"),
                              description: formData.get("description"),
                              startTime: toIsoLocal(formData.get("startTime")),
                              endTime: toIsoLocal(formData.get("endTime")),
                            }),
                          });
                          form.reset();
                          setCreatingContest(false);
                          await loadContests();
                          logResult("Contest created", result);
                        });
                      }}
                    >
                      <label><span>Title</span><input name="title" required /></label>
                      <label><span>Description</span><textarea name="description" required rows="4"></textarea></label>
                      <label><span>Start time</span><input name="startTime" required type="datetime-local" /></label>
                      <label><span>End time</span><input name="endTime" required type="datetime-local" /></label>
                      <button type="submit">Publish contest</button>
                    </form>
                  ) : null}
                </section>
              ) : (
                <section className="panel">
                  <div className="panel-heading">
                    <h2>Contestee view</h2>
                    <p>Your signed-in area is focused on finding and following contests.</p>
                  </div>
                  <div className="info-card">
                    <strong>Signed in successfully</strong>
                    <p>
                      Use the contest list to choose a round, then open details and the leaderboard
                      from the contest tools panel.
                    </p>
                  </div>
                </section>
              )}

              <section className="panel">
                <div className="panel-heading">
                  <h2>Contest detail</h2>
                  <p>Selected contest data from the backend.</p>
                </div>
                <pre className="output compact">{contestDetail || "No contest loaded yet."}</pre>
              </section>

              <section className="panel">
                <div className="panel-heading">
                  <h2>Leaderboard</h2>
                  <p>Ranking output for the selected contest.</p>
                </div>
                <pre className="output compact">{leaderboardOutput || "No leaderboard loaded yet."}</pre>
              </section>

              <section className="panel panel-wide">
                <div className="panel-heading">
                  <h2>Response console</h2>
                  <p>Useful while wiring and testing the app against the backend.</p>
                </div>
                <pre className="output output-large">{consoleOutput}</pre>
              </section>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
