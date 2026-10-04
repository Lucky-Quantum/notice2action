import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import pdf from "pdf-parse";
import {
  NOTICE_SCHEMA,
  NOTICE_SYSTEM_PROMPT,
} from "@/lib/prompt";

export const runtime = "nodejs";

const PRIMARY_MODEL =
  process.env.GEMMA_MODEL || "gemma-4-31b-it";

const FALLBACK_MODEL =
  process.env.GEMMA_FALLBACK_MODEL ||
  "gemma-4-26b-a4b-it";

const MAX_RETRIES = 2;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_NOTICE_CHARS = 120_000;

function cleanJson(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTemporaryModelError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("temporarily")
  );
}

async function generateWithRetry(
  ai: GoogleGenAI,
  model: string,
  contents: any
) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: NOTICE_SYSTEM_PROMPT,
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: NOTICE_SCHEMA,
        },
      });
    } catch (error) {
      lastError = error;

      if (
        !isTemporaryModelError(error) ||
        attempt === MAX_RETRIES
      ) {
        throw error;
      }

      await sleep(1500 * Math.pow(2, attempt));
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    /* ---------------------------------------------
       API KEY
    --------------------------------------------- */

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Missing GEMINI_API_KEY. Add it to .env.local.",
        },
        { status: 500 }
      );
    }

    /* ---------------------------------------------
       FORM DATA
    --------------------------------------------- */

    const form = await request.formData();

    const friendName = String(
      form.get("friendName") || ""
    ).trim();

    const situation = String(
      form.get("situation") || ""
    ).trim();

    const language = String(
      form.get("language") || "Simple English"
    ).trim();

    const pastedText = String(
      form.get("text") || ""
    ).trim();

    const file = form.get("file");

    /* ---------------------------------------------
       VALIDATION
    --------------------------------------------- */

    if (!friendName) {
      return NextResponse.json(
        {
          error:
            "Please enter your friend's name.",
        },
        { status: 400 }
      );
    }

    if (!situation) {
      return NextResponse.json(
        {
          error:
            "Please describe the problem you're solving for your friend.",
        },
        { status: 400 }
      );
    }

    if (
      !file &&
      !pastedText
    ) {
      return NextResponse.json(
        {
          error:
            "Add a notice PDF, image, TXT file, or pasted text.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------
       GEMMA CLIENT
    --------------------------------------------- */

    const ai = new GoogleGenAI({
      apiKey,
    });

    const profile = `
Friend name: ${friendName}
Friend situation: ${situation}
Preferred language: ${language}
`.trim();

    const basePrompt = `
${NOTICE_SYSTEM_PROMPT}

FRIEND PROFILE:
${profile}

Analyze the notice specifically for this friend.

Important:
- Never invent information.
- Never claim eligibility when the notice does not provide enough evidence.
- Separate notice facts from assumptions.
- Give practical actions.
- Return JSON only.
`.trim();

    let contents: any;

    /* ---------------------------------------------
       FILE
    --------------------------------------------- */

    if (
      file &&
      file instanceof File &&
      file.size > 0
    ) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error:
              "File is too large. Maximum size is 10 MB.",
          },
          { status: 400 }
        );
      }

      const bytes = Buffer.from(
        await file.arrayBuffer()
      );

      /* PDF */

      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        const parsed = await pdf(bytes);

        const noticeText =
          parsed.text
            .slice(0, MAX_NOTICE_CHARS)
            .trim();

        if (!noticeText) {
          return NextResponse.json(
            {
              error:
                "This PDF does not contain readable text.",
            },
            { status: 400 }
          );
        }

        contents = `
${basePrompt}

NOTICE TEXT:
${noticeText}
`.trim();
      }

      /* IMAGE */

      else if (file.type.startsWith("image/")) {
        contents = [
          {
            role: "user",
            parts: [
              {
                text: basePrompt,
              },
              {
                inlineData: {
                  mimeType: file.type,
                  data: bytes.toString("base64"),
                },
              },
            ],
          },
        ];
      }

      /* TXT */

      else if (
        file.type === "text/plain" ||
        file.name.toLowerCase().endsWith(".txt")
      ) {
        const noticeText =
          new TextDecoder()
            .decode(bytes)
            .slice(0, MAX_NOTICE_CHARS)
            .trim();

        contents = `
${basePrompt}

NOTICE TEXT:
${noticeText}
`.trim();
      }

      /* UNSUPPORTED */

      else {
        return NextResponse.json(
          {
            error:
              "Unsupported file type. Use PDF, PNG, JPG, WEBP, or TXT.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------
       PASTED NOTICE
    --------------------------------------------- */

    else {
      contents = `
${basePrompt}

NOTICE TEXT:
${pastedText.slice(
        0,
        MAX_NOTICE_CHARS
      )}
`.trim();
    }

    /* ---------------------------------------------
       PRIMARY GEMMA
    --------------------------------------------- */

    let response;
    let usedModel = PRIMARY_MODEL;

    try {
      response = await generateWithRetry(
        ai,
        PRIMARY_MODEL,
        contents
      );
    } catch (primaryError) {
      console.warn(
        "Primary Gemma model failed:",
        primaryError
      );

      /* -------------------------------------------
         FALLBACK GEMMA
      ------------------------------------------- */

      if (
        PRIMARY_MODEL !== FALLBACK_MODEL
      ) {
        usedModel = FALLBACK_MODEL;

        response = await generateWithRetry(
          ai,
          FALLBACK_MODEL,
          contents
        );
      } else {
        throw primaryError;
      }
    }

    /* ---------------------------------------------
       RESPONSE
    --------------------------------------------- */

    const rawText =
      response?.text || "";

    if (!rawText.trim()) {
      throw new Error(
        "Gemma returned an empty response."
      );
    }

    let result;

    try {
      result = cleanJson(rawText);
    } catch {
      console.error(
        "Invalid JSON from Gemma:",
        rawText
      );

      throw new Error(
        "Gemma returned an invalid response. Please try again."
      );
    }

    return NextResponse.json({
      result,
      model: usedModel,
    });
  } catch (error) {
    console.error(
      "Notice2Action API error:",
      error
    );

    if (
      isTemporaryModelError(error)
    ) {
      return NextResponse.json(
        {
          error:
            "Gemma is temporarily under high demand. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Analysis failed.",
      },
      { status: 500 }
    );
  }
}