import Link from "next/link";
import { useState } from "react";

interface MapHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const MapHeader = ({ isSidebarOpen, setIsSidebarOpen }: MapHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center z-[1000] relative">
      <Link href="/">
        <h1 className="text-2xl font-bold text-gray-900">OpenCrimeReports</h1>
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden lg:flex gap-6 items-center">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
        >
          {isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        </button>
        <span className="text-gray-900 font-medium border-b-2 border-gray-900 pb-1">
          Map
        </span>
        <Link
          href="/dashboard"
          className="text-gray-700 hover:text-gray-900 font-medium"
        >
          Dashboard
        </Link>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden flex items-center gap-2">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
        >
          {isSidebarOpen ? "Hide" : "Show"}
        </button>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-700 hover:text-gray-900"
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

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full right-6 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg py-2 min-w-[120px] z-50">
            <span className="block px-4 py-2 text-gray-900 font-medium border-l-2 border-gray-900 bg-gray-50">
              Map
            </span>
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};
