import { pageUser } from "@/server/page-auth";
import { Dashboard } from "@/components/dashboard/dashboard";
export default async function Page() {
  const user = await pageUser("admin");
  return <Dashboard user={user} />;
}
