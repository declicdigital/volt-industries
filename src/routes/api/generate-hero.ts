import { createFileRoute } from "@tanstack/react-router";

/**
 * Generation du portrait de personnage.
 *
 * Source IA : cle Google AI Studio (GEMINI_API_KEY) appelee EN DIRECT.
 * Aucun credit Lovable n'est consomme par cette route.
 * Si la cle est absente, on renvoie une erreur explicite : pas de rendu de secours.
 */
export const Route = createFileRoute("/api/generate-hero")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          image?: string; // data URL ou base64 brut
          prompt?: string;
          key?: string; // cle fournie par le joueur (optionnel)
        };

        if (!body.image) return new Response("Missing image", { status: 400 });
        if (!body.prompt) return new Response("Missing prompt", { status: 400 });

        const key = (body.key || process.env["GEMINI_API_KEY"] || "").trim();
        if (!key) {
          return new Response(
            JSON.stringify({
              error: "no_key",
              message:
                "Aucune cle IA configuree. Ajoute une cle Google AI Studio (gratuite) dans les reglages du projet, ou colle ta cle dans le jeu.",
            }),
            { status: 428, headers: { "Content-Type": "application/json" } },
          );
        }

        // data URL -> { mimeType, data }
        const raw = body.image;
        let mimeType = "image/jpeg";
        let data = raw;
        const m = /^data:([^;]+);base64,(.*)$/s.exec(raw);
        if (m) {
          mimeType = m[1];
          data = m[2];
        }

        const model = "gemini-2.5-flash-image";
        const upstream = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": key,
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: body.prompt },
                    { inlineData: { mimeType, data } },
                  ],
                },
              ],
              generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
            }),
          },
        );

        const text = await upstream.text();
        if (!upstream.ok) {
          return new Response(text, {
            status: upstream.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        let b64: string | undefined;
        try {
          const json = JSON.parse(text) as {
            candidates?: {
              content?: {
                parts?: { inlineData?: { data?: string }; inline_data?: { data?: string } }[];
              };
            }[];
          };
          const parts = json.candidates?.[0]?.content?.parts ?? [];
          for (const p of parts) {
            const d = p.inlineData?.data ?? p.inline_data?.data;
            if (d) {
              b64 = d;
              break;
            }
          }
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
