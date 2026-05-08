"use client";

import { useEffect, useState } from "react";
import "./dashboard.css";

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

        {/* Schedule info */}
        <div className="schedule-info">
          <span className="schedule-text">
            pipeline runs every sunday at 8pm
          </span>
          <span className="schedule-divider">·</span>
          <span className="schedule-last">last run · {lastRun}</span>
        </div>

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
                  style={{ color: "#666", fontSize: "12px", padding: "24px 0" }}
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
          <span>3 agents · reddit · product hunt · hacker news</span>
          <span>idea radar</span>
        </div>
      </div>
    </>
  );
}
