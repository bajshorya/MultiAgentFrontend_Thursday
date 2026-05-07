export const ErrorState = ({ message }: { message: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 mb-4">
          <svg
            className="w-6 h-6 text-rose-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-slate-700 font-medium">{message}</p>
        <p className="text-slate-500 text-sm mt-2">
          Make sure the backend is running at localhost:3001
        </p>
      </div>
    </div>
  );
};
