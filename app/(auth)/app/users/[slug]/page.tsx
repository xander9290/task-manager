import { fetchUser } from "@/actions/user-action";
import FormUsers from "@/components/forms/FomrUser";

async function PageUsers({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const res = await fetchUser({ slug });
  if (!res.success) {
    return <div>Error: {res.message}</div>;
  }

  const user = res.data ?? null;

  return <FormUsers user={user} />;
}

export default PageUsers;
