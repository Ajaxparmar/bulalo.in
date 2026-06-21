import { redirect } from "next/navigation";
import { clearSession } from "@/app/lib/auth";

export async function GET() {
  redirect("/");
}

export async function POST() {
  await clearSession();
  redirect("/login");
}
