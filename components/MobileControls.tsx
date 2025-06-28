interface MobileControlsProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const MobileControls = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: MobileControlsProps) => {
  return (
    <>
      {/* Sidebar Toggle Button - Mobile Only */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-20 left-4 bg-white text-black p-3 rounded-lg border-2 border-black hover:bg-gray-100 transition-colors shadow-lg z-[1000]"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};
