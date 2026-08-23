import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Volt Industries — Laboratoire d'élite" },
      {
        name: "description",
        content:
          "Volt Industries — Laboratoire d'élite : choisissez votre héros ou votre villain, menez missions, combats et alliances au fil d'une carrière unique.",
      },
      { property: "og:title", content: "Volt Industries — Laboratoire d'élite" },
      {
        property: "og:description",
        content:
          "Choisissez votre héros ou votre villain et menez votre carrière au Laboratoire d'élite Volt Industries.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://volt-industries.lovable.app/" },
      {
        property: "og:image",
        content: "https://volt-industries.lovable.app/og-volt-industries.jpg",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "800" },
      { property: "og:image:alt", content: "Volt Industries — Le choix de l'énergie" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: "https://volt-industries.lovable.app/og-volt-industries.jpg",
      },

    ],
    links: [{ rel: "canonical", href: "https://volt-industries.lovable.app/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      <h1 className="sr-only">Volt Industries — Laboratoire d'élite</h1>
      <iframe
        src="/game/volt-industries.html"
        title="Volt Industries — Laboratoire d'élite"
        className="h-full w-full border-0"
      />
    </main>
  );
}
