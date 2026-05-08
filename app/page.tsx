"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

interface Opportunity {
  title: string;
  oneLiner: string;
  demandEvidence: string;
  competitionLevel: "low" | "medium" | "high";
  mvpScope: string;
  acquisitionChannel: string;
  redFlag: string;
}

interface Brief {
  _id: string;
  createdAt: string;
  top3Opportunities: Opportunity[];
  narrativeTraps: string[];
  risingTheme: string;
  contraryTake: string;
}

interface AgentStatus {
  reddit: { runAt: string; rawCount: number; error?: string } | null;
  producthunt: { runAt: string; rawCount: number; error?: string } | null;
  hackernews?: { runAt: string; rawCount: number; error?: string } | null;
}

interface Idea {
  _id: string;
  title: string;
  oneLiner: string;
  demandEvidence?: string;
  competitionLevel?: "low" | "medium" | "high";
  mvpScope?: string;
  acquisitionChannel?: string;
  redFlag?: string;
  seenCount: number;
  score: number;
  trend: "rising" | "stable" | "fading";
  sources: string[];
  firstSeenAt?: string;
  lastSeenAt?: string;
}

const competitionConfig = {
  low: {
    label: "LOW COMPETITION",
    color: "#00ff88",
    bg: "rgba(0,255,136,0.08)",
  },
  medium: {
    label: "MED COMPETITION",
    color: "#ffaa00",
    bg: "rgba(255,170,0,0.08)",
  },
  high: {
    label: "HIGH COMPETITION",
    color: "#ff4444",
    bg: "rgba(255,68,68,0.08)",
  },
};

const trendConfig = {
  rising: { label: "↑ RISING", color: "#00ff88" },
  stable: { label: "→ STABLE", color: "#888" },
  fading: { label: "↓ FADING", color: "#ff4444" },
};

function IdeaDialog({ idea, onClose }: { idea: Idea; onClose: () => void }) {
  const comp = competitionConfig[idea.competitionLevel ?? "medium"];
  const t = trendConfig[idea.trend];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog">
        <div className="dialog-header">
          <div className="dialog-title">{idea.title}</div>
          <button className="dialog-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="dialog-meta">
          {idea.competitionLevel && (
            <span
              className="comp-badge"
              style={{ color: comp.color, background: comp.bg }}
            >
              {comp.label}
            </span>
          )}
          <span
            style={{
              color: t.color,
              fontSize: "11px",
              letterSpacing: "0.08em",
            }}
          >
            {t.label}
          </span>
          <div className="idea-sources">
            {idea.sources.map((s) => (
              <span className="source-chip" key={s}>
                {s.replace("weekly-brief", "BRIEF").toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        <div className="dialog-body">
          <div className="dialog-stats">
            <div className="dialog-stat">
              <div className="dialog-stat-val">{idea.seenCount}×</div>
              <div className="dialog-stat-label">TIMES SEEN</div>
            </div>
            <div className="dialog-stat">
              <div className="dialog-stat-val">{idea.score}</div>
              <div className="dialog-stat-label">SCORE</div>
            </div>
            <div className="dialog-stat">
              <div
                className="dialog-stat-val"
                style={{ fontSize: "13px", paddingTop: "5px" }}
              >
                {idea.firstSeenAt
                  ? new Date(idea.firstSeenAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </div>
              <div className="dialog-stat-label">FIRST SEEN</div>
            </div>
          </div>

          <div className="dialog-liner">{idea.oneLiner}</div>

          <div className="dialog-grid">
            {idea.demandEvidence && (
              <div className="dialog-field-full">
                <div className="field-label">Demand Evidence</div>
                <div className="field-value">{idea.demandEvidence}</div>
              </div>
            )}
            {idea.mvpScope && (
              <div className="dialog-field">
                <div className="field-label">MVP Scope</div>
                <div className="field-value">{idea.mvpScope}</div>
              </div>
            )}
            {idea.acquisitionChannel && (
              <div className="dialog-field">
                <div className="field-label">Acquisition Channel</div>
                <div className="field-value">{idea.acquisitionChannel}</div>
              </div>
            )}
            {idea.redFlag && (
              <div className="dialog-field-full">
                <div className="field-label">Red Flag</div>
                <div className="field-value red-flag-value">{idea.redFlag}</div>
              </div>
            )}
          </div>

          {idea.lastSeenAt && (
            <div
              style={{
                fontSize: "10px",
                color: "#333",
                letterSpacing: "0.08em",
              }}
            >
              LAST SEEN ·{" "}
              {new Date(idea.lastSeenAt)
                .toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
                .toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [agents, setAgents] = useState<AgentStatus | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const [activeTab, setActiveTab] = useState<"brief" | "tracker">("brief");
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [briefRes, agentRes, ideasRes] = await Promise.all([
          fetch(`${API}/brief/latest`),
          fetch(`${API}/agents/latest`),
          fetch(`${API}/ideas`),
        ]);
        setBrief(await briefRes.json());
        setAgents(await agentRes.json());
        setIdeas(await ideasRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080808",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'IBM Plex Mono', monospace",
          color: "#333",
          fontSize: "13px",
          letterSpacing: "0.1em",
        }}
      >
        LOADING INTELLIGENCE BRIEF...
      </div>
    );

  if (!brief)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080808",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'IBM Plex Mono', monospace",
          color: "#333",
          fontSize: "13px",
        }}
      >
        NO BRIEF FOUND — RUN PIPELINE FIRST
      </div>
    );

  const opp = brief.top3Opportunities[selected];
  const comp = competitionConfig[opp?.competitionLevel ?? "medium"];

  const agentList = [
    { key: "reddit", label: "REDDIT", data: agents?.reddit },
    { key: "producthunt", label: "PRODUCT HUNT", data: agents?.producthunt },
    { key: "hackernews", label: "HACKER NEWS", data: agents?.hackernews },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #080808; }

        .dashboard {
          min-height: 100vh;
          background: #080808;
          color: #e8e8e8;
          font-family: 'IBM Plex Mono', monospace;
          padding: 0;
        }

        /* Scanline overlay */
        .dashboard::before {
          content: '';
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
          z-index: 100;
        }

        .topbar {
          border-bottom: 1px solid #1a1a1a;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          background: rgba(8,8,8,0.95);
          backdrop-filter: blur(8px);
          z-index: 10;
        }

        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-dot {
          width: 8px;
          height: 8px;
          background: #00ff88;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 24px;
          font-size: 11px;
          color: #444;
          letter-spacing: 0.08em;
        }

        .date-stamp {
          color: #555;
          font-size: 11px;
          letter-spacing: 0.06em;
        }

        .nav-tabs {
          display: flex;
          gap: 0;
          border: 1px solid #1a1a1a;
          border-radius: 4px;
          overflow: hidden;
        }

        .nav-tab {
          padding: 6px 16px;
          font-size: 10px;
          letter-spacing: 0.1em;
          cursor: pointer;
          border: none;
          font-family: 'IBM Plex Mono', monospace;
          transition: all 0.15s;
          background: transparent;
          color: #444;
        }

        .nav-tab.active {
          background: #1a1a1a;
          color: #e8e8e8;
        }

        .main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px;
        }

        /* Agent status bar */
        .agent-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #111;
          border: 1px solid #111;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 32px;
        }

        .agent-cell {
          background: #0c0c0c;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .agent-name {
          font-size: 10px;
          letter-spacing: 0.12em;
          color: #555;
        }

        .agent-meta {
          font-size: 10px;
          color: #333;
          margin-top: 3px;
        }

        .agent-status {
          font-size: 10px;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border-radius: 2px;
        }

        .status-ok { color: #00ff88; background: rgba(0,255,136,0.08); }
        .status-err { color: #ff4444; background: rgba(255,68,68,0.08); }
        .status-none { color: #444; background: rgba(255,255,255,0.04); }

        /* Opportunity selector */
        .opp-selector {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .opp-tab {
          flex: 1;
          padding: 12px 16px;
          background: #0c0c0c;
          border: 1px solid #1a1a1a;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          font-family: 'IBM Plex Mono', monospace;
        }

        .opp-tab:hover { border-color: #2a2a2a; background: #0f0f0f; }

        .opp-tab.active {
          border-color: #00ff88;
          background: rgba(0,255,136,0.04);
        }

        .opp-tab-num {
          font-size: 10px;
          color: #444;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }

        .opp-tab.active .opp-tab-num { color: #00ff88; }

        .opp-tab-title {
          font-size: 11px;
          color: #888;
          line-height: 1.4;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
        }

        .opp-tab.active .opp-tab-title { color: #e8e8e8; }

        /* Main opportunity card */
        .opp-card {
          background: #0c0c0c;
          border: 1px solid #1a1a1a;
          border-radius: 6px;
          padding: 28px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }

        .opp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, #00ff88, transparent);
        }

        .opp-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
          gap: 16px;
        }

        .opp-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .comp-badge {
          font-size: 10px;
          letter-spacing: 0.1em;
          padding: 5px 10px;
          border-radius: 2px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .opp-liner {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 28px;
          font-family: 'Syne', sans-serif;
          font-weight: 400;
        }

        .opp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #111;
          border: 1px solid #111;
          border-radius: 4px;
          overflow: hidden;
        }

        .opp-field {
          background: #080808;
          padding: 16px;
        }

        .field-label {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: #333;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .field-value {
          font-size: 12px;
          color: #aaa;
          line-height: 1.6;
          font-family: 'Syne', sans-serif;
        }

        .red-flag-value {
          color: #ff6666;
        }

        /* Bottom row */
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .info-card {
          background: #0c0c0c;
          border: 1px solid #1a1a1a;
          border-radius: 6px;
          padding: 20px;
        }

        .card-label {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: #333;
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .card-value {
          font-size: 13px;
          color: #bbb;
          line-height: 1.6;
          font-family: 'Syne', sans-serif;
        }

        .rising-theme-value {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          line-height: 1.3;
        }

        /* Narrative traps */
        .traps-card {
          background: #0c0c0c;
          border: 1px solid #1a1a1a;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .trap-item {
          display: flex;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #111;
          align-items: flex-start;
        }

        .trap-item:last-child { border-bottom: none; }

        .trap-x {
          color: #ff4444;
          font-size: 11px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .trap-text {
          font-size: 12px;
          color: #666;
          line-height: 1.5;
          font-family: 'Syne', sans-serif;
        }

        /* Idea tracker */
        .tracker-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .tracker-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
        }

        .tracker-subtitle {
          font-size: 11px;
          color: #444;
          margin-top: 4px;
          letter-spacing: 0.04em;
        }

        .ideas-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: #111;
          border: 1px solid #111;
          border-radius: 6px;
          overflow: hidden;
        }

        .idea-row {
          background: #0c0c0c;
          padding: 16px 20px;
          display: grid;
          grid-template-columns: 1fr auto auto auto;
          gap: 24px;
          align-items: center;
          cursor: pointer;
          transition: background 0.1s;
        }

        .idea-row:hover { background: #111; }

        .idea-row:hover .idea-title { color: #fff; }

        .idea-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #ccc;
          margin-bottom: 3px;
          transition: color 0.1s;
        }

        .idea-liner {
          font-size: 11px;
          color: #444;
          font-family: 'Syne', sans-serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 400px;
        }

        .idea-sources {
          display: flex;
          gap: 4px;
        }

        .source-chip {
          font-size: 9px;
          letter-spacing: 0.06em;
          padding: 2px 6px;
          border-radius: 2px;
          background: #111;
          color: #444;
          border: 1px solid #1a1a1a;
        }

        .idea-seen {
          font-size: 11px;
          color: #444;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        .idea-trend {
          font-size: 10px;
          letter-spacing: 0.08em;
          white-space: nowrap;
          min-width: 80px;
          text-align: right;
        }

        .ideas-empty {
          padding: 40px;
          text-align: center;
          font-size: 12px;
          color: #333;
          letter-spacing: 0.06em;
        }

        /* Section divider */
        .section-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .divider-label {
          font-size: 10px;
          letter-spacing: 0.15em;
          color: #333;
          white-space: nowrap;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #111;
        }

        /* Dialog */
        .dialog-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          z-index: 200; display: flex; align-items: center; justify-content: center;
          padding: 32px; animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .dialog {
          background: #0c0c0c; border: 1px solid #222; border-radius: 8px;
          width: 100%; max-width: 720px; max-height: 85vh; overflow-y: auto;
          position: relative; animation: slideUp 0.2s ease;
        }
        .dialog::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, #00ff88, transparent 60%);
          border-radius: 8px 8px 0 0;
        }
        .dialog-header { padding: 28px 28px 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .dialog-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700; color: #fff; line-height: 1.2; letter-spacing: -0.02em; }
        .dialog-close { background: #111; border: 1px solid #1a1a1a; color: #555; width: 32px; height: 32px; border-radius: 4px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; font-family: 'IBM Plex Mono', monospace; }
        .dialog-close:hover { color: #fff; border-color: #333; background: #1a1a1a; }
        .dialog-meta { padding: 12px 28px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #111; flex-wrap: wrap; }
        .dialog-body { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 20px; }
        .dialog-liner { font-family: 'Syne', sans-serif; font-size: 15px; color: #777; line-height: 1.6; }
        .dialog-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #111; border: 1px solid #111; border-radius: 4px; overflow: hidden; }
        .dialog-field { background: #080808; padding: 16px; }
        .dialog-field-full { background: #080808; padding: 16px; grid-column: 1 / -1; }
        .dialog-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #111; border: 1px solid #111; border-radius: 4px; overflow: hidden; }
        .dialog-stat { background: #080808; padding: 14px 16px; text-align: center; }
        .dialog-stat-val { font-size: 22px; font-weight: 600; font-family: 'Syne', sans-serif; color: #fff; margin-bottom: 4px; }
        .dialog-stat-label { font-size: 9px; letter-spacing: 0.12em; color: #333; }
      `}</style>

      <div className="dashboard">
        {selectedIdea && (
          <IdeaDialog
            idea={selectedIdea}
            onClose={() => setSelectedIdea(null)}
          />
        )}

        {/* Topbar */}
        <div className="topbar">
          <div className="logo">
            <div className="logo-dot" />
            IDEA RADAR
          </div>
          <div className="topbar-right">
            <span className="date-stamp">
              BRIEF ·{" "}
              {new Date(brief.createdAt)
                .toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
                .toUpperCase()}
            </span>
            <div className="nav-tabs">
              <button
                className={`nav-tab ${activeTab === "brief" ? "active" : ""}`}
                onClick={() => setActiveTab("brief")}
              >
                WEEKLY BRIEF
              </button>
              <button
                className={`nav-tab ${activeTab === "tracker" ? "active" : ""}`}
                onClick={() => setActiveTab("tracker")}
              >
                IDEA TRACKER
              </button>
            </div>
          </div>
        </div>

        <div className="main">
          {/* Agent status */}
          <div className="agent-bar">
            {agentList.map(({ key, label, data }) => (
              <div className="agent-cell" key={key}>
                <div>
                  <div className="agent-name">{label}</div>
                  <div className="agent-meta">
                    {data
                      ? `${data.rawCount} ITEMS · ${new Date(data.runAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
                      : "NO DATA"}
                  </div>
                </div>
                <span
                  className={`agent-status ${!data ? "status-none" : data.error ? "status-err" : "status-ok"}`}
                >
                  {!data ? "N/A" : data.error ? "ERR" : "OK"}
                </span>
              </div>
            ))}
          </div>

          {activeTab === "brief" && (
            <>
              {/* Opportunity selector */}
              <div className="section-divider">
                <span className="divider-label">TOP OPPORTUNITIES</span>
                <div className="divider-line" />
              </div>

              <div className="opp-selector">
                {brief.top3Opportunities.map((o, i) => (
                  <button
                    key={i}
                    className={`opp-tab ${selected === i ? "active" : ""}`}
                    onClick={() => setSelected(i)}
                  >
                    <div className="opp-tab-num">#{i + 1}</div>
                    <div className="opp-tab-title">{o.title}</div>
                  </button>
                ))}
              </div>

              {/* Main opportunity card */}
              {opp && (
                <div className="opp-card">
                  <div className="opp-header">
                    <div className="opp-title">{opp.title}</div>
                    <span
                      className="comp-badge"
                      style={{ color: comp.color, background: comp.bg }}
                    >
                      {comp.label}
                    </span>
                  </div>
                  <div className="opp-liner">{opp.oneLiner}</div>
                  <div className="opp-grid">
                    <div className="opp-field">
                      <div className="field-label">Demand Evidence</div>
                      <div className="field-value">{opp.demandEvidence}</div>
                    </div>
                    <div className="opp-field">
                      <div className="field-label">MVP Scope</div>
                      <div className="field-value">{opp.mvpScope}</div>
                    </div>
                    <div className="opp-field">
                      <div className="field-label">Acquisition Channel</div>
                      <div className="field-value">
                        {opp.acquisitionChannel}
                      </div>
                    </div>
                    <div className="opp-field">
                      <div className="field-label">Red Flag</div>
                      <div className="field-value red-flag-value">
                        {opp.redFlag}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom row */}
              <div className="bottom-grid">
                <div className="info-card">
                  <div className="card-label">Rising Theme</div>
                  <div className="rising-theme-value">{brief.risingTheme}</div>
                </div>
                <div className="info-card">
                  <div className="card-label">Contrary Take</div>
                  <div className="card-value">{brief.contraryTake}</div>
                </div>
              </div>

              {/* Narrative traps */}
              <div className="section-divider">
                <span className="divider-label">NARRATIVE TRAPS</span>
                <div className="divider-line" />
              </div>
              <div className="traps-card">
                {brief.narrativeTraps.map((trap, i) => (
                  <div className="trap-item" key={i}>
                    <span className="trap-x">✕</span>
                    <span className="trap-text">{trap}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "tracker" && (
            <>
              <div className="tracker-header">
                <div>
                  <div className="tracker-title">Idea Tracker</div>
                  <div className="tracker-subtitle">
                    {ideas.length} IDEAS · CLICK ANY ROW TO EXPAND
                  </div>
                </div>
              </div>

              <div className="ideas-list">
                {ideas.length === 0 ? (
                  <div className="ideas-empty">NO IDEAS TRACKED YET</div>
                ) : (
                  ideas.map((idea) => {
                    const t = trendConfig[idea.trend];
                    return (
                      <div
                        className="idea-row"
                        key={idea._id}
                        onClick={() => setSelectedIdea(idea)}
                      >
                        <div>
                          <div className="idea-title">{idea.title}</div>
                          <div className="idea-liner">{idea.oneLiner}</div>
                        </div>
                        <div className="idea-sources">
                          {idea.sources.map((s) => (
                            <span className="source-chip" key={s}>
                              {s.replace("weekly-brief", "BRIEF").toUpperCase()}
                            </span>
                          ))}
                        </div>
                        <div className="idea-seen">SEEN {idea.seenCount}×</div>
                        <div className="idea-trend" style={{ color: t.color }}>
                          {t.label}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
