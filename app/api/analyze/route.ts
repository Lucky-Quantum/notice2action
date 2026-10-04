import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import pdf from "pdf-parse";
import { NOTICE_SCHEMA, NOTICE_SYSTEM_PROMPT } from "@/lib/prompt";

export const runtime = "nodejs";

function cleanJson(text: string) {
  const stripped = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(stripped);
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

    const form = await request.formData();
    const friendName = String(form.get("friendName") || "my friend");
    const situation = String(form.get("situation") || "Often misses opportunities because notices are confusing or easy to overlook.");
    const language = String(form.get("language") || "Simple English");
    const pastedText = String(form.get("text") || "").trim();
    const file = form.get("file");

    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMMA_MODEL || "gemma-4-31b-it";

    const profile = `Friend name: ${friendName}\nFriend situation: ${situation}\nPreferred language: ${language}`;
    const basePrompt = `${NOTICE_SYSTEM_PROMPT}\n\nFRIEND PROFILE:\n${profile}\n\nAnalyze the supplied notice and return structured JSON.`;

    let contents: any;
    if (file && file instanceof File && file.size > 0) {
      const bytes = Buffer.from(await file.arrayBuffer());
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const parsed = await pdf(bytes);
        const text = parsed.text.slice(0, 120_000);
        contents = `${basePrompt}\n\nNOTICE TEXT:\n${text}`;
      } else if (file.type.startsWith("image/")) {
        contents = [{
          role: "user",
          parts: [
            { text: basePrompt },
            { inlineData: { mimeType: file.type, data: bytes.toString("base64") } }
          ]
        }];
      } else {
        contents = `${basePrompt}\n\nNOTICE TEXT:\n${new TextDecoder().decode(bytes).slice(0, 120_000)}`;
      }
    } else if (pastedText) {
      contents = `${basePrompt}\n\nNOTICE TEXT:\n${pastedText.slice(0, 120_000)}`;
    } else {
      return NextResponse.json({ error: "Add a notice image/PDF/text before analyzing." }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: NOTICE_SYSTEM_PROMPT,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: NOTICE_SCHEMA,
      },
    });

    const result = cleanJson(response.text || "{}");
    return NextResponse.json({ result, model });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Analysis failed."
    }, { status: 500 });
  }
}
