import { auth } from "@/libs/auth";

async function PageApp() {
  const session = await auth();
  return <div>{session?.user?.name}</div>;
}

export default PageApp;
