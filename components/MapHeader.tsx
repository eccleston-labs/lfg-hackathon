import Link from "next/link";

export const MapHeader = () => {
  return (
    <header className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center z-[1000]">
      <Link href="/">
        <h1 className="text-2xl font-bold text-gray-900">OpenCrimeReports</h1>
      </Link>
      <div className="flex gap-6">
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
    </header>
  );
};
