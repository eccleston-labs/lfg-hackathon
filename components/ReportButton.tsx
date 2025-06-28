interface ReportButtonProps {
  onClick: () => void;
}

export const ReportButton = ({ onClick }: ReportButtonProps) => {
  return (
    <button
      className="fixed bottom-6 right-6 bg-white text-black font-bold text-lg px-6 py-3 rounded-lg border-2 border-black hover:bg-gray-100 transition-colors shadow-lg z-[1000]"
      onClick={onClick}
    >
      Report
    </button>
  );
};
