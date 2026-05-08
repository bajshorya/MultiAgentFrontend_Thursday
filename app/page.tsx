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

const trendConfig = {
  rising: { label: "↑ rising", color: "#00ff88" },
  stable: { label: "→ stable", color: "#555" },
  fading: { label: "↓ fading", color: "#ff4444" },
};

const compLabel = {
  low: "low competition",
  medium: "medium competition",
  high: "high competition",
};

function IdeaDialog({ idea, onClose }: { idea: Idea; onClose: () => void }) {
  const t = trendConfig[idea.trend];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const fields = [
    { label: "demand evidence", value: idea.demandEvidence },
    { label: "mvp scope", value: idea.mvpScope },
    { label: "acquisition", value: idea.acquisitionChannel },
    { label: "red flag", value: idea.redFlag, danger: true },
  ].filter((f) => f.value);

  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog">
        <div className="dialog-top">
          <div className="dialog-meta-row">
            <span style={{ color: t.color, fontSize: "11px" }}>{t.label}</span>
            {idea.competitionLevel && (
              <span className="dmeta">{compLabel[idea.competitionLevel]}</span>
            )}
            <span className="dmeta">seen {idea.seenCount}×</span>
            <span className="dmeta">score {idea.score}</span>
            {idea.firstSeenAt && (
              <span className="dmeta">
                first seen{" "}
                {new Date(idea.firstSeenAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <h2 className="dialog-title">{idea.title}</h2>
        <p className="dialog-liner">{idea.oneLiner}</p>

        <div className="dfields">
          {fields.map((f) => (
            <div className="dfield" key={f.label}>
              <div className="dfield-label">{f.label}</div>
              <div
                className="dfield-value"
                style={f.danger ? { color: "#cc5555" } : {}}
              >
                {f.value}
              </div>
            </div>
          ))}
        </div>

        {idea.lastSeenAt && (
          <div className="dialog-footer">
            last seen ·{" "}
            {new Date(idea.lastSeenAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        )}
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

  if (loading) return <div className="state-screen">loading...</div>;

  if (!brief)
    return (
      <div className="state-screen">no brief found — run pipeline first</div>
    );

  const opp = brief.top3Opportunities[selected];

  const agentLine = [
    { label: "reddit", data: agents?.reddit },
    { label: "product hunt", data: agents?.producthunt },
    { label: "hacker news", data: agents?.hackernews },
  ]
    .map((a) => {
      if (!a.data) return `${a.label} · no data`;
      if (a.data.error) return `${a.label} · error`;
      return `${a.label} · ${a.data.rawCount} items`;
    })
    .join("   ");

  const lastRun = brief.createdAt
    ? new Date(brief.createdAt)
        .toLocaleDateString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
        .toLowerCase()
    : "—";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0a0a0a; color: #c8c8c8; font-family: 'IBM Plex Mono', monospace; }

        .state-screen {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #0a0a0a; color: #444; font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
        }

        .wrap { max-width: 960px; margin: 0 auto; padding: 48px 32px; }

        /* Header */
        .header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 10px; }
        .logo { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.03em; }
        .nav { display: flex; gap: 24px; }
        .nav-item { font-size: 12px; color: #444; cursor: pointer; transition: color 0.1s; background: none; border: none; font-family: 'IBM Plex Mono', monospace; padding: 0; }
        .nav-item:hover { color: #aaa; }
        .nav-item.active { color: #c8c8c8; }

        /* Agent line */
        .agent-line { font-size: 11px; color: #333; margin-bottom: 48px; letter-spacing: 0.02em; }

        /* Brief layout */
        .brief-layout { display: grid; grid-template-columns: 200px 1fr; gap: 48px; }

        /* Sidebar */
        .sidebar { display: flex; flex-direction: column; gap: 2px; padding-top: 4px; }
        .sidebar-item {
          display: flex; align-items: baseline; gap: 12px;
          padding: 10px 12px; border-radius: 4px;
          cursor: pointer; transition: background 0.1s;
          border: none; background: none; text-align: left;
          font-family: 'IBM Plex Mono', monospace; width: 100%;
        }
        .sidebar-item:hover { background: #111; }
        .sidebar-item.active { background: #111; }
        .sidebar-num { font-size: 10px; color: #333; flex-shrink: 0; }
        .sidebar-item.active .sidebar-num { color: #555; }
        .sidebar-title { font-size: 11px; color: #444; line-height: 1.5; font-family: 'Syne', sans-serif; font-weight: 600; }
        .sidebar-item.active .sidebar-title { color: #c8c8c8; }

        /* Content */
        .content {}
        .opp-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700; color: #fff; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 6px; }
        .opp-comp { font-size: 11px; color: #444; margin-bottom: 20px; }
        .opp-liner { font-size: 14px; color: #666; line-height: 1.7; margin-bottom: 36px; font-family: 'Syne', sans-serif; }

        /* Fields */
        .fields { display: flex; flex-direction: column; }
        .field { padding: 16px 0; border-top: 1px solid #141414; }
        .field:last-child { border-bottom: 1px solid #141414; }
        .field-label { font-size: 9px; letter-spacing: 0.15em; color: #333; margin-bottom: 8px; text-transform: uppercase; }
        .field-value { font-size: 13px; color: #888; line-height: 1.6; font-family: 'Syne', sans-serif; }
        .field-danger { color: #cc5555; }

        /* Bottom section */
        .bottom { margin-top: 56px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
        .bottom-block {}
        .bottom-label { font-size: 9px; letter-spacing: 0.15em; color: #2a2a2a; text-transform: uppercase; margin-bottom: 12px; }
        .bottom-value { font-size: 14px; color: #666; line-height: 1.7; font-family: 'Syne', sans-serif; }
        .rising-value { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #bbb; line-height: 1.3; letter-spacing: -0.02em; }

        /* Traps */
        .traps { margin-top: 48px; }
        .traps-label { font-size: 9px; letter-spacing: 0.15em; color: #2a2a2a; text-transform: uppercase; margin-bottom: 16px; }
        .trap { display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid #111; align-items: baseline; }
        .trap:last-child { border-bottom: 1px solid #111; }
        .trap-mark { font-size: 10px; color: #333; flex-shrink: 0; }
        .trap-text { font-size: 12px; color: #555; line-height: 1.6; font-family: 'Syne', sans-serif; }

        /* Tracker */
        .tracker-head { margin-bottom: 32px; }
        .tracker-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.02em; margin-bottom: 4px; }
        .tracker-sub { font-size: 11px; color: #333; }

        .ideas { display: flex; flex-direction: column; }
        .idea-row {
          display: grid; grid-template-columns: 1fr 100px 60px;
          gap: 24px; align-items: center;
          padding: 16px 0; border-top: 1px solid #111;
          cursor: pointer; transition: all 0.1s;
        }
        .idea-row:last-child { border-bottom: 1px solid #111; }
        .idea-row:hover .idea-name { color: #fff; }
        .idea-row:hover .idea-arrow { opacity: 1; }
        .idea-name { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #888; margin-bottom: 3px; transition: color 0.1s; }
        .idea-sub { font-size: 11px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 500px; }
        .idea-seen { font-size: 11px; color: #333; text-align: right; }
        .idea-trend { font-size: 11px; text-align: right; }
        .idea-arrow { opacity: 0; transition: opacity 0.1s; font-size: 11px; color: #444; }

        /* Footer */
        .footer { margin-top: 80px; padding-top: 24px; border-top: 1px solid #111; font-size: 11px; color: #2a2a2a; display: flex; justify-content: space-between; }

        /* Dialog */
        .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8);
          z-index: 100; display: flex; align-items: center; justify-content: center;
          padding: 32px; animation: fi 0.15s ease;
        }
        @keyframes fi { from { opacity: 0; } to { opacity: 1; } }
        @keyframes su { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .dialog {
          background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 6px;
          width: 100%; max-width: 580px; max-height: 80vh; overflow-y: auto;
          padding: 32px; animation: su 0.18s ease; position: relative;
        }
        .dialog-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .dialog-meta-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .dmeta { font-size: 11px; color: #333; }
        .close-btn { background: none; border: none; color: #444; cursor: pointer; font-size: 13px; font-family: 'IBM Plex Mono', monospace; padding: 4px; transition: color 0.1s; }
        .close-btn:hover { color: #aaa; }
        .dialog-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 12px; }
        .dialog-liner { font-family: 'Syne', sans-serif; font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 28px; }
        .dfields { display: flex; flex-direction: column; }
        .dfield { padding: 14px 0; border-top: 1px solid #111; }
        .dfield:last-child { border-bottom: 1px solid #111; }
        .dfield-label { font-size: 9px; letter-spacing: 0.15em; color: #2a2a2a; text-transform: uppercase; margin-bottom: 7px; }
        .dfield-value { font-size: 12px; color: #777; line-height: 1.6; font-family: 'Syne', sans-serif; }
        .dialog-footer { font-size: 10px; color: #2a2a2a; margin-top: 24px; letter-spacing: 0.04em; }
      `}</style>

      {selectedIdea && (
        <IdeaDialog idea={selectedIdea} onClose={() => setSelectedIdea(null)} />
      )}

      <div className="wrap">
        {/* Header */}
        <div className="header">
          <div className="logo">idea radar</div>
          <nav className="nav">
            <button
              className={`nav-item ${activeTab === "brief" ? "active" : ""}`}
              onClick={() => setActiveTab("brief")}
            >
              weekly brief
            </button>
            <button
              className={`nav-item ${activeTab === "tracker" ? "active" : ""}`}
              onClick={() => setActiveTab("tracker")}
            >
              idea tracker
            </button>
          </nav>
        </div>

        {/* Agent status line */}
        <div className="agent-line">{agentLine}</div>

        {activeTab === "brief" && (
          <>
            <div className="brief-layout">
              {/* Sidebar */}
              <div className="sidebar">
                {brief.top3Opportunities.map((o, i) => (
                  <button
                    key={i}
                    className={`sidebar-item ${selected === i ? "active" : ""}`}
                    onClick={() => setSelected(i)}
                  >
                    <span className="sidebar-num">0{i + 1}</span>
                    <span className="sidebar-title">{o.title}</span>
                  </button>
                ))}
              </div>

              {/* Main content */}
              {opp && (
                <div className="content">
                  <div className="opp-title">{opp.title}</div>
                  <div className="opp-comp">
                    {compLabel[opp.competitionLevel]}
                  </div>
                  <div className="opp-liner">{opp.oneLiner}</div>

                  <div className="fields">
                    {[
                      { label: "demand evidence", value: opp.demandEvidence },
                      { label: "mvp scope", value: opp.mvpScope },
                      { label: "acquisition", value: opp.acquisitionChannel },
                    ].map((f) => (
                      <div className="field" key={f.label}>
                        <div className="field-label">{f.label}</div>
                        <div className="field-value">{f.value}</div>
                      </div>
                    ))}
                    <div className="field">
                      <div className="field-label">red flag</div>
                      <div className="field-value field-danger">
                        {opp.redFlag}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom */}
            <div className="bottom">
              <div className="bottom-block">
                <div className="bottom-label">rising theme</div>
                <div className="rising-value">{brief.risingTheme}</div>
              </div>
              <div className="bottom-block">
                <div className="bottom-label">contrary take</div>
                <div className="bottom-value">{brief.contraryTake}</div>
              </div>
            </div>

            {/* Traps */}
            <div className="traps">
              <div className="traps-label">narrative traps</div>
              {brief.narrativeTraps.map((trap, i) => (
                <div className="trap" key={i}>
                  <span className="trap-mark">—</span>
                  <span className="trap-text">{trap}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "tracker" && (
          <>
            <div className="tracker-head">
              <div className="tracker-title">idea tracker</div>
              <div className="tracker-sub">
                {ideas.length} ideas tracked across weeks
              </div>
            </div>

            <div className="ideas">
              {ideas.length === 0 ? (
                <div
                  style={{ color: "#333", fontSize: "12px", padding: "24px 0" }}
                >
                  no ideas tracked yet
                </div>
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
                        <div className="idea-name">{idea.title}</div>
                        <div className="idea-sub">{idea.oneLiner}</div>
                      </div>
                      <div className="idea-seen">seen {idea.seenCount}×</div>
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

        {/* Footer */}
        <div className="footer">
          <span>last run · {lastRun} · 3 agents</span>
          <span>idea radar</span>
        </div>
      </div>
    </>
  );
}
