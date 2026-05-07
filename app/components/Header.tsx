import { formatDate } from "@/app/lib/utils";

interface HeaderProps {
  createdAt: string;
}

export const Header = ({ createdAt }: HeaderProps) => {
  return (
    <div className="mb-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-slate-950">
            Idea Radar
          </h1>
          <p className="text-slate-500 text-sm mt-2">Weekly insights brief</p>
        </div>
        <p className="text-slate-400 text-sm font-medium">
          {formatDate(createdAt)}
        </p>
      </div>
    </div>
  );
};
