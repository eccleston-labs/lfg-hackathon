"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Report {
  id: string;
  created_at: string;
  raw_text: string;
  postcode: string;
  location_hint: string;
  time_description: string;
  crime_type: string;
  status: string;
  people_appearance?: string;
  has_vehicle: boolean;
  has_weapon: boolean;
  photos?: { id: string; file_path: string }[];
}

interface DashboardStats {
  totalReports: number;
  reportsToday: number;
  reportsThisWeek: number;
  reportsWithPhotos: number;
  vehicleInvolved: number;
  weaponInvolved: number;
  topCrimeTypes: { type: string; count: number }[];
  topPostcodes: { postcode: string; count: number }[];
}

export default function DashboardPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load all reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (reportsError) {
        console.error("Error loading reports:", reportsError);
        return;
      }

      // Load photos for all reports
      const { data: photosData, error: photosError } = await supabase
        .from("report_photos")
        .select("*");

      if (photosError) {
        console.error("Error loading photos:", photosError);
      }

      // Group photos by report_id
      const photosByReportId = (photosData || []).reduce((acc, photo) => {
        if (!acc[photo.report_id]) {
          acc[photo.report_id] = [];
        }
        acc[photo.report_id].push(photo);
        return acc;
      }, {} as Record<string, any[]>);

      // Attach photos to reports
      const reportsWithPhotos = (reportsData || []).map((report) => ({
        ...report,
        photos: photosByReportId[report.id] || [],
      }));

      setReports(reportsWithPhotos);

      // Calculate statistics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalReports = reportsWithPhotos.length;
      const reportsToday = reportsWithPhotos.filter(
        (r) => new Date(r.created_at) >= today
      ).length;
      const reportsThisWeek = reportsWithPhotos.filter(
        (r) => new Date(r.created_at) >= weekAgo
      ).length;
      const reportsWithPhotos_count = reportsWithPhotos.filter(
        (r) => r.photos && r.photos.length > 0
      ).length;
      const vehicleInvolved = reportsWithPhotos.filter(
        (r) => r.has_vehicle
      ).length;
      const weaponInvolved = reportsWithPhotos.filter(
        (r) => r.has_weapon
      ).length;

      // Top crime types
      const crimeTypeCounts = reportsWithPhotos.reduce((acc, report) => {
        const type = report.crime_type || "Unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCrimeTypes = Object.entries(crimeTypeCounts)
        .map(([type, count]) => ({ type, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top postcodes
      const postcodeCounts = reportsWithPhotos.reduce((acc, report) => {
        const postcode = report.postcode || "Unknown";
        acc[postcode] = (acc[postcode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topPostcodes = Object.entries(postcodeCounts)
        .map(([postcode, count]) => ({ postcode, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalReports,
        reportsToday,
        reportsThisWeek,
        reportsWithPhotos: reportsWithPhotos_count,
        vehicleInvolved,
        weaponInvolved,
        topCrimeTypes,
        topPostcodes,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-gray-900">OpenCrimeReports</h1>
        </Link>
        <div className="flex gap-6">
          <Link
            href="/map"
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            Map
          </Link>
          <span className="text-gray-900 font-medium border-b-2 border-gray-900 pb-1">
            Dashboard
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">
            Overview of crime reports and community safety data
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            <span className="ml-3 text-lg">Loading dashboard data...</span>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.totalReports || 0}
                </div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.reportsToday || 0}
                </div>
                <div className="text-sm text-gray-600">Reports Today</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.reportsThisWeek || 0}
                </div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.reportsWithPhotos || 0}
                </div>
                <div className="text-sm text-gray-600">With Photos</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-2xl font-bold text-red-600">
                  {stats?.vehicleInvolved || 0}
                </div>
                <div className="text-sm text-gray-600">Vehicle Involved</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-2xl font-bold text-red-800">
                  {stats?.weaponInvolved || 0}
                </div>
                <div className="text-sm text-gray-600">Weapon Involved</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Top Crime Types */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Top Crime Types
                </h3>
                <div className="space-y-3">
                  {stats?.topCrimeTypes.map((item, index) => (
                    <div
                      key={item.type}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span className="capitalize">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded-full h-2 w-20">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.max(
                                10,
                                (item.count / (stats?.totalReports || 1)) * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                  {stats?.topCrimeTypes.length === 0 && (
                    <div className="text-gray-500 text-center py-4">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Top Locations */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Top Locations
                </h3>
                <div className="space-y-3">
                  {stats?.topPostcodes.map((item, index) => (
                    <div
                      key={item.postcode}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span className="font-mono">{item.postcode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded-full h-2 w-20">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${Math.max(
                                10,
                                (item.count / (stats?.totalReports || 1)) * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                  {stats?.topPostcodes.length === 0 && (
                    <div className="text-gray-500 text-center py-4">
                      No data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Recent Reports
                </h3>
                <Link
                  href="/map"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  View on Map →
                </Link>
              </div>

              <div className="space-y-4">
                {reports.slice(0, 10).map((report) => (
                  <div
                    key={report.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-900 capitalize">
                        {report.crime_type || "Crime"} at{" "}
                        {report.location_hint || report.postcode}
                      </div>
                      <div className="flex items-center gap-2">
                        {report.photos && report.photos.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            📷 {report.photos.length}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      {report.time_description &&
                        `When: ${report.time_description}`}
                    </div>

                    <div className="text-sm text-gray-700 line-clamp-2 mb-2">
                      {report.raw_text}
                    </div>

                    <div className="flex gap-2">
                      {report.has_vehicle && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          Vehicle
                        </span>
                      )}
                      {report.has_weapon && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          Weapon
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          report.status === "submitted"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}

                {reports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📊</div>
                    <div className="text-lg font-medium mb-2">
                      No reports yet
                    </div>
                    <div className="text-sm">
                      Reports will appear here once submitted
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
