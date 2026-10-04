# Notice2Action

**From “What does this notice mean?” to “Here is exactly what to do next.”**

Notice2Action is a friend-first AI tool for students and young adults who regularly miss scholarships, internships, college opportunities, community programs, and other time-sensitive notices because the source material is long, confusing, or buried inside screenshots and chats.

## Hacktoberfest 2026 — Weekend Challenge

Theme: **Build for a Friend**

This repository was started during the Hacktoberfest Weekend Challenge entry window (October 2–5, 2026). It is a new project for the contest, not a pull request to an existing project.

## What it does

1. Captures a notice as a PDF, screenshot, or pasted text.
2. Uses **Gemma 4** to extract the deadline, key requirements and eligibility signals.
3. Personalizes the analysis around one friend's situation.
4. Produces a document checklist and a prioritized action plan.
5. Generates a short message the user can send to the friend.

## Stack

- Next.js App Router
- TypeScript
- React
- Tailwind-inspired custom CSS (single global stylesheet for speed)
- Google GenAI SDK
- **Gemma 4 31B IT** via the Gemini API
- `pdf-parse` for PDF text extraction

Google's current documentation lists `gemma-4-31b-it` as a supported Gemma model through the Gemini API.

## Run locally

```bash
npm install
cp .env.example .env.local
# add your Gemini API key to .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

```text
GEMINI_API_KEY=...
GEMMA_MODEL=gemma-4-31b-it
```

Keep the API key server-side. Do not commit `.env.local`.

## Why Gemma / open innovation

The model is not a decorative chatbot feature. It is the core transformation from raw notice -> verified fields -> eligibility reasoning -> action plan. Using an open-weight model allows the same product pattern to be inspected, adapted, or self-hosted instead of requiring the product logic to be permanently tied to one closed model.

## Safety / limitations

Notice2Action is an assistant, not an official eligibility authority. The model is instructed not to invent missing facts, but users should still verify deadlines and eligibility against the original notice before acting.

## Demo scenario

For the demo, the interface includes a sample Student Opportunity Fund notice. Replace it with a real notice from the friend you are building for when recording the final demo and write-up.

## License

MIT — see `LICENSE`.

## Official references

- Hacktoberfest Weekend Challenge: https://dev.to/challenges/hacktoberfest-weekend-2026-10-01
- Contest rules: https://dev.to/page/hacktoberfest-weekend-challenge-26-10-01-contest-rules
- Gemma model documentation: https://ai.google.dev/gemma/docs
