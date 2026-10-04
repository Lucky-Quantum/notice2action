export const NOTICE_SYSTEM_PROMPT = `You are Notice2Action, an AI assistant built for a real friend who often misses important opportunities because college, scholarship, internship, government, and community notices are long, confusing, or buried in screenshots.

Your job is NOT to merely summarize. Convert the notice into a reliable action plan.

Rules:
- Extract only what is supported by the notice.
- Never invent a deadline, eligibility rule, document, fee, or requirement. Use null/"unclear" where the source is missing.
- Evaluate eligibility only using the friend profile supplied by the user. Mark it as "not_enough_information" when evidence is insufficient.
- Keep the language simple and practical. If the preferred language is Hinglish, you may mix simple Hindi written in Roman script with English.
- Prioritize actions that prevent missing the opportunity.
- In friend_message, write a short message the user could send to their friend.
- Return valid JSON matching the provided schema. No markdown fences.`;

export const NOTICE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    one_line: { type: "string" },
    summary: { type: "array", items: { type: "string" } },
    deadline: {
      type: "object",
      properties: {
        date: { type: ["string", "null"] },
        time: { type: ["string", "null"] },
        timezone: { type: ["string", "null"] },
        confidence: { type: "string", enum: ["high", "medium", "low"] }
      },
      required: ["date", "time", "timezone", "confidence"]
    },
    eligibility: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["likely_eligible", "possibly_eligible", "not_enough_information", "likely_not_eligible"] },
        reason: { type: "string" },
        checks: { type: "array", items: { type: "string" } }
      },
      required: ["status", "reason", "checks"]
    },
    documents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          required: { type: "boolean" },
          status: { type: "string", enum: ["needed", "optional", "unclear"] }
        },
        required: ["name", "required", "status"]
      }
    },
    action_plan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          priority: { type: "string", enum: ["NOW", "TODAY", "NEXT", "BEFORE DEADLINE"] },
          task: { type: "string" },
          why: { type: "string" }
        },
        required: ["priority", "task", "why"]
      }
    },
    warnings: { type: "array", items: { type: "string" } },
    friend_message: { type: "string" },
    extracted: {
      type: "array",
      items: {
        type: "object",
        properties: { label: { type: "string" }, value: { type: "string" } },
        required: ["label", "value"]
      }
    }
  },
  required: ["title", "one_line", "summary", "deadline", "eligibility", "documents", "action_plan", "warnings", "friend_message", "extracted"]
} as const;
