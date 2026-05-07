import { COMPETITION_COLORS } from "@/app/lib/constants";
import { Opportunity } from "@/app/types";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
  const { title, oneLiner, competitionLevel } = opportunity;
  const competitionColor = COMPETITION_COLORS[competitionLevel];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-slate-950 mb-3">
            {title}
          </h2>
          <p className="text-slate-600 leading-relaxed">{oneLiner}</p>
        </div>
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 whitespace-nowrap ${competitionColor}`}
        >
          {competitionLevel} competition
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
        <DetailField label="Evidence" value={opportunity.demandEvidence} />
        <DetailField label="MVP Scope" value={opportunity.mvpScope} />
        <DetailField
          label="Acquisition"
          value={opportunity.acquisitionChannel}
        />
        <DetailField label="Red Flag" value={opportunity.redFlag} />
      </div>
    </div>
  );
};

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
      {label}
    </p>
    <p className="text-slate-700 text-sm">{value}</p>
  </div>
);
