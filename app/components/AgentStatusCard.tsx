import { STATUS_COLORS } from "@/app/lib/constants";
import { formatTime } from "@/app/lib/utils";

interface AgentData {
  runAt: string;
  rawCount: number;
  error?: string;
}

interface AgentStatusCardProps {
  label: string;
  data: AgentData | null;
}

export const AgentStatusCard = ({ label, data }: AgentStatusCardProps) => {
  const hasError = data?.error;
  const statusKey = hasError ? "error" : "ok";
  const statusColor = STATUS_COLORS[statusKey as keyof typeof STATUS_COLORS];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-900">{label}</h3>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor}`}
        >
          {hasError ? "error" : "active"}
        </span>
      </div>
      {data ? (
        <p className="text-xs text-slate-500">
          {data.rawCount} items · {formatTime(data.runAt)}
        </p>
      ) : (
        <p className="text-xs text-slate-400">No data available</p>
      )}
    </div>
  );
};
