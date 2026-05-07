"use client";

import { useEffect, useState } from "react";
import {
  Header,
  AgentStatusCard,
  OpportunitiesNav,
  OpportunityCard,
  InsightCard,
  NarrativeTrapsList,
  LoadingState,
  ErrorState,
} from "@/app/components";
import { API_BASE } from "@/app/lib/constants";
import type { Brief, AgentStatus, Idea } from "@/app/types";

export default function Dashboard() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [agents, setAgents] = useState<AgentStatus | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [briefRes, agentRes, ideasRes] = await Promise.all([
          fetch(`${API_BASE}/brief/latest`),
          fetch(`${API_BASE}/agents/latest`),
          fetch(`${API_BASE}/ideas`),
        ]);

        if (!briefRes.ok || !agentRes.ok) {
          throw new Error("Failed to fetch data from backend");
        }

        const briefData = await briefRes.json();
        const agentData = await agentRes.json();
        const ideasData = ideasRes.ok ? await ideasRes.json() : [];
        setBrief(briefData);
        setAgents(agentData);
        setIdeas(ideasData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load brief. Please try again.",
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingState />;

  if (error) return <ErrorState message={error} />;

  if (!brief)
    return <ErrorState message="No brief found. Run the pipeline first." />;

  const opportunity = brief.top3Opportunities[selected];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
        {/* Header */}
        <Header createdAt={brief.createdAt} />

        {/* Agent Status */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <AgentStatusCard label="Reddit" data={agents?.reddit || null} />
          <AgentStatusCard
            label="Product Hunt"
            data={agents?.producthunt || null}
          />
        </div>

        {/* Opportunities Navigation */}
        <OpportunitiesNav
          count={brief.top3Opportunities.length}
          selected={selected}
          onChange={setSelected}
        />

        {/* Main Opportunity Card */}
        {opportunity && <OpportunityCard opportunity={opportunity} />}

        {/* Insights Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <InsightCard title="Rising Theme">{brief.risingTheme}</InsightCard>
          <InsightCard title="Contrary Take">{brief.contraryTake}</InsightCard>
        </div>

        {/* Narrative Traps */}
        <NarrativeTrapsList traps={brief.narrativeTraps} />

        {/* Idea Tracker */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mt-4">
          <h3 className="text-sm font-medium mb-3 text-gray-400 uppercase tracking-wide">
            Idea tracker
          </h3>
          <div className="space-y-3">
            {ideas.map((idea) => (
              <div key={idea._id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{idea.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    seen {idea.seenCount}x · score {idea.score}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    idea.trend === "rising"
                      ? "bg-green-900 text-green-300"
                      : idea.trend === "fading"
                        ? "bg-red-900 text-red-300"
                        : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {idea.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
