import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminPlayersClient from "@/components/admin/players/AdminPlayersClient";

export default async function AdminPlayersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || !isAdmin) {
    redirect("/admin/login");
  }

  const { data: players, error } = await supabase
    .from("players")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return <AdminPlayersClient initialPlayers={players ?? []} />;
}