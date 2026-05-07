interface OpportunitiesNavProps {
  count: number;
  selected: number;
  onChange: (index: number) => void;
}

export const OpportunitiesNav = ({
  count,
  selected,
  onChange,
}: OpportunitiesNavProps) => {
  return (
    <div className="flex gap-2 mb-8">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
            selected === i
              ? "bg-slate-950 text-white shadow-sm"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Idea {i + 1}
        </button>
      ))}
    </div>
  );
};
