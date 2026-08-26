import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { WelcomeClient } from "./WelcomeClient";

export default async function WelcomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <WelcomeClient email={user.email} />;
}
