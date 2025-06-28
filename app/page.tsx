import { createClient } from "@/utils/supabase/client";

export default async function Home() {
  const supabase = createClient();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>
        <p className="text-lg text-gray-600">Your app is ready to build!</p>
      </div>
    </main>
  );
}
