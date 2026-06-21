import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["about_title", "about_body"] } },
  });
  const value = (key: string, fallback: string) =>
    settings.find((setting) => setting.key === key)?.value || fallback;

  return (
    <main className="content-page">
      <section className="content-page-panel">
        <p className="eyebrow">About Bulalo.in</p>
        <h1>{value("about_title", "Helping people discover trusted local businesses")}</h1>
        <div className="content-page-copy">
          {value(
            "about_body",
            "Bulalo.in connects customers with local shops and service providers. Our directory helps businesses become easier to discover while giving visitors a simple way to find services near them.",
          ).split(/\n{2,}/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>
    </main>
  );
}
