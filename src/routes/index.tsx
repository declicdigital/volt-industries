import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VOLT INDUSTRIES — Jeu de gestion industrielle" },
      {
        name: "description",
        content:
          "Jouez à VOLT INDUSTRIES : développez votre empire industriel, gérez la production, l'énergie et vos équipes dans ce jeu de stratégie.",
      },
      { property: "og:title", content: "VOLT INDUSTRIES — Jeu de gestion industrielle" },
      {
        property: "og:description",
        content:
          "Développez votre empire industriel : production, énergie et stratégie dans VOLT INDUSTRIES.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      <h1 className="sr-only">VOLT INDUSTRIES</h1>
      <iframe
        src="/game/volt-industries.html"
        title="VOLT INDUSTRIES"
        className="h-full w-full border-0"
      />
    </main>
  );
}
