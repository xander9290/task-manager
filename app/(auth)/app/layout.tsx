import TopNav from "@/components/top-nav/TopNav";
import { SessionProvider } from "next-auth/react";

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <TopNav />
      <main className="container-fluid vh-100">{children}</main>
    </SessionProvider>
  );
}

export default AppLayout;
