import { createFileRoute } from "@tanstack/react-router";

/**
 * Generation du portrait de personnage via Lovable AI Gateway.
 * Modele image Gemini (shape chat : messages + modalities), image du joueur en entree.
 */
export const Route = createFileRoute("/api/generate-hero")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          image?: string; // data URL ou base64 brut
          prompt?: string;
        };

        if (!body.image) return new Response("Missing image", { status: 400 });
        if (!body.prompt) return new Response("Missing prompt", { status: 400 });

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response(
            JSON.stringify({ error: "no_key", message: "AI non configuree sur le projet." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        // Normalise en data URL (le content block image_url en a besoin).
        const raw = body.image;
        const dataUrl = /^data:/.test(raw) ? raw : `data:image/jpeg;base64,${raw}`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-image",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: body.prompt },
                  { type: "image_url", image_url: { url: dataUrl } },
                ],
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        const text = await upstream.text();
        if (!upstream.ok) {
          return new Response(text, {
            status: upstream.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        let b64: string | undefined;
        try {
          const json = JSON.parse(text) as { data?: { b64_json?: string }[] };
          b64 = json.data?.[0]?.b64_json;
        } catch {
          /* handled below */
        }

        if (!b64) {
          return new Response(
            JSON.stringify({
              error: "no_image",
              message: "Le modele n'a pas renvoye d'image. Relance la generation.",
            }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }

        return new Response(JSON.stringify({ data: [{ b64_json: b64 }] }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
