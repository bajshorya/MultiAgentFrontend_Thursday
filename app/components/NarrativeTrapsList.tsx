interface NarrativeTrapsListProps {
  traps: string[];
}

export const NarrativeTrapsList = ({ traps }: NarrativeTrapsListProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Narrative Traps
      </h3>
      <ul className="space-y-3">
        {traps.map((trap, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-700">
            <span className="text-slate-400 mt-0.5 flex-shrink-0">−</span>
            <span>{trap}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
