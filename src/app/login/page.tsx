import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

type Props = {
  searchParams: Promise<{ error?: string; reason?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/app");

  const params = await searchParams;
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16">
      <LoginForm error={params.error} reason={params.reason} />
    </div>
  );
}
