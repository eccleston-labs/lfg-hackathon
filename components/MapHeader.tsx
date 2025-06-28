import Link from "next/link";

interface MapHeaderProps {
  activePage?: "map" | "dashboard";
}

export const MapHeader = ({ activePage = "map" }: MapHeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-[1000] relative">
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-3">
          <svg
            className="w-8 h-8 text-red-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900">OpenCrimeReports</h1>
        </div>
      </Link>

      {/* Simplified Navigation */}
      <div className="flex gap-1">
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
    </header>
  );
};
