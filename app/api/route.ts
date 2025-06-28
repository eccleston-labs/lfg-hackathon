import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("users").select("*");
  console.log(data);

  return new Response("hello world");
}
