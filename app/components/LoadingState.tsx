export const LoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-950 rounded-full animate-spin" />
        </div>
        <p className="text-slate-500 text-sm mt-4 font-medium">
          Loading brief...
        </p>
      </div>
    </div>
  );
};
