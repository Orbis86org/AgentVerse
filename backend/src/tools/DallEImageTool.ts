// src/tools/DallEImageTool.ts

import { z } from "zod";
import { StructuredTool } from "langchain/tools";
import { OpenAI } from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export class DallEImageTool extends StructuredTool {
    name = "generate_image";
    description = "Generate a DALL-E 3 image from a text prompt";
    schema = z.object({
        prompt: z.string().describe("A detailed description of the image you want to generate."),
    });

    async _call({ prompt }: z.infer<typeof this.schema>): Promise<string> {
        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt,
                n: 1,
                size: "1024x1024",
            });

            const imageUrl = response.data?.[0]?.url;
            if (!imageUrl) {
                throw new Error("No image URL returned.");
            }
            return imageUrl;
        } catch (err) {
            console.error("Image generation error:", err);
            return "Failed to generate the image.";
        }
    }
}
