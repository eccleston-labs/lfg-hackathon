interface ReportButtonProps {
  onClick: () => void;
}

export const ReportButton = ({ onClick }: ReportButtonProps) => {
  return (
    <button
      className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg px-8 py-4 rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-2xl hover:shadow-red-500/40 z-[1000] flex items-center gap-3 backdrop-blur-sm border-2 border-red-400/30 hover:border-red-300/50 ring-4 ring-red-500/10 hover:ring-red-500/20"
      onClick={onClick}
    >
      <svg
        className="w-7 h-7 flex-shrink-0 drop-shadow-sm"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="font-bold tracking-wide drop-shadow-sm">Report</span>
    </button>
  );
};
