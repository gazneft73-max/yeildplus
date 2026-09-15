import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { getSession } from "@/lib/server/session";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const session = await getSession().catch(() => null);
  return (
    <>
      <Navbar signedIn={Boolean(session)} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
