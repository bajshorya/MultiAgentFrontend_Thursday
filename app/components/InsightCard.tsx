interface InsightCardProps {
  title: string;
  children: React.ReactNode;
}

export const InsightCard = ({ title, children }: InsightCardProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        {title}
      </h3>
      <div className="text-slate-700 text-sm leading-relaxed">{children}</div>
    </div>
  );
};
