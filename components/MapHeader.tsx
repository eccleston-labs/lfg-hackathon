import Link from "next/link";
import { useState } from "react";

interface MapHeaderProps {
  activePage?: "map" | "dashboard";
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const MapHeader = ({
  activePage = "map",
  isMobileMenuOpen: externalIsMobileMenuOpen,
  setIsMobileMenuOpen: externalSetIsMobileMenuOpen,
}: MapHeaderProps) => {
  const [internalIsMobileMenuOpen, setInternalIsMobileMenuOpen] =
    useState(false);

  // Use external state if provided, otherwise use internal state
  const isMobileMenuOpen = externalIsMobileMenuOpen ?? internalIsMobileMenuOpen;
  const setIsMobileMenuOpen =
    externalSetIsMobileMenuOpen ?? setInternalIsMobileMenuOpen;

  return (
    <header className="bg-white border-b border-gray-200 z-[1000] relative">
      {/* Main header */}
      <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2 sm:gap-3">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-red-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
              <span className="hidden sm:inline">OpenCrimeReports</span>
              <span className="sm:hidden">OCR</span>
            </h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-1">
          <Link
            href="/map"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activePage === "map"
                ? "text-gray-900 underline underline-offset-4"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Map
          </Link>
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activePage === "dashboard"
                ? "text-gray-900 underline underline-offset-4"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Dashboard
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="py-2 space-y-1">
            <Link
              href="/map"
              className={`block px-4 py-3 font-medium transition-colors ${
                activePage === "map"
                  ? "text-gray-900 bg-gray-50 border-r-4 border-blue-500"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Map
            </Link>
            <Link
              href="/dashboard"
              className={`block px-4 py-3 font-medium transition-colors ${
                activePage === "dashboard"
                  ? "text-gray-900 bg-gray-50 border-r-4 border-blue-500"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
