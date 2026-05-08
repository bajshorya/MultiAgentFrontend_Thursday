export interface Opportunity {
  title: string;
  oneLiner: string;
  demandEvidence: string;
  competitionLevel: "low" | "medium" | "high";
  mvpScope: string;
  acquisitionChannel: string;
  redFlag: string;
}

export interface Brief {
  _id: string;
  createdAt: string;
  top3Opportunities: Opportunity[];
  narrativeTraps: string[];
  risingTheme: string;
  contraryTake: string;
}

export interface AgentStatus {
  reddit: { runAt: string; rawCount: number; error?: string } | null;
  producthunt: { runAt: string; rawCount: number; error?: string } | null;
}

export interface Idea {
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
