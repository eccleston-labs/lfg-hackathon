import { createClient } from "@/utils/supabase/client";

export default async function Home() {
  const supabase = createClient();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-gray-50">
      <div className="w-full max-w-4xl mx-auto text-center space-y-8 sm:space-y-10 lg:space-y-12">
        {/* Header */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
            ProtectOurStreets
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-700 leading-relaxed max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-0">
            Report crimes and anti-social behaviour in your area; view a
            real-time map of user reports.
          </p>
        </div>

        {/* Search Form */}
        <div className="space-y-4 sm:space-y-5 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter a UK postcode, street, or address"
              className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-base sm:text-lg md:text-xl border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>

          <button
            type="button"
            className="w-full bg-gray-900 text-white text-base sm:text-lg md:text-xl font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-gray-800 active:bg-gray-950 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 touch-manipulation"
          >
            Use my location
          </button>
        </div>
      </div>
    </main>
  );
}
