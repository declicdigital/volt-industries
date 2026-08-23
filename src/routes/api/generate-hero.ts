import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-hero")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          image?: string; // data URL or raw base64
          prompt?: string;
          stream?: boolean;
        };
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        if (!body.image) return new Response("Missing image", { status: 400 });
        if (!body.prompt) return new Response("Missing prompt", { status: 400 });

        const imageUrl = body.image.startsWith("data:")
          ? body.image
          : `data:image/jpeg;base64,${body.image}`;
        const stream = body.stream !== false;

        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/images/generations",
          {
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
                    { type: "image_url", image_url: { url: imageUrl } },
                  ],
                },
              ],
              modalities: ["image", "text"],
              ...(stream ? { stream: true } : {}),
            }),
          },
        );

        if (!upstream.ok || !upstream.body) {
          return new Response(await upstream.text(), { status: upstream.status });
        }
        if (!stream) {
          return new Response(upstream.body, {
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
