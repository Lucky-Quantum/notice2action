# Notice2Action

> **From “What does this notice mean?” to “Here is exactly what to do next.”**

Notice2Action is a friend-first AI tool for students and young adults who regularly miss scholarships, internships, college opportunities, community programs, and other time-sensitive notices because the source material is long, confusing, or buried inside screenshots and chats.

Instead of giving another generic summary, Notice2Action turns a notice into a **personalized decision-and-action layer**: what matters, whether the person appears eligible, what documents are needed, what could be missing, what to do next, and a short message they can send to their friend.

---

## Hacktoberfest 2026 — Weekend Challenge

**Theme:** Build for a Friend

Notice2Action was started as a new project for the Hacktoberfest Weekend Challenge entry window (**October 2–5, 2026**). It is being developed specifically around a real friend-first problem rather than as a pull request to an existing project.

---

## The problem

Important opportunities are often communicated through:

- long PDF circulars
- screenshots shared in WhatsApp or Telegram groups
- college notices with dense eligibility rules
- scattered deadline information
- documents whose requirements are easy to overlook

The problem is not simply **“I need an AI chatbot.”**

It is:

> **“Tell me what this notice means for me, what I need, and what I should do before the deadline.”**

---

## What it does

1. **Captures a notice** as a PDF, screenshot, TXT file, or pasted text.
2. **Uses Gemma 4** to extract deadlines, requirements, eligibility signals, warnings, and key facts.
3. **Personalizes the analysis** around one friend's situation and preferred language.
4. **Produces a document checklist** with required/optional status.
5. **Creates a prioritized action plan** with concrete next steps.
6. **Generates a friend-ready message** that can be copied and sent.

### Core flow

```text
Notice
  ↓
Extract important facts
  ↓
Understand eligibility signals
  ↓
Compare with friend's context
  ↓
Identify documents + missing information
  ↓
Prioritize actions
  ↓
Send a simple friend-ready summary
```

---

## Why this is different from a generic summarizer

A normal summarizer might tell you:

> “This scholarship is for undergraduate students with family income below ₹3 lakh.”

Notice2Action goes one step further:

```text
DEADLINE
8 October · 5:00 PM IST

ELIGIBILITY
Likely eligible / Needs a check / Likely not eligible

DOCUMENTS
✓ Student ID
✓ Marksheet
✓ Fee receipt
⚠ Income certificate

YOUR PLAN
TODAY       → Collect the required documents
NEXT        → Verify the eligibility conditions
DEADLINE    → Submit through the correct portal

SEND TO FRIEND
→ One short message they can actually understand
```

The product is therefore designed around **action**, not just extraction.

---

## Tech stack

- **Next.js App Router**
- **TypeScript**
- **React**
- **Custom CSS** for the interface
- **Google GenAI SDK**
- **Gemma 4** via the Gemini API
- **pdf-parse** for PDF text extraction
- Client-side file validation for supported notice uploads
- Server-side AI processing so the Gemini API key is never exposed in browser code

### Model configuration

Primary model:

```text
GEMMA_MODEL=gemma-4-31b-it
```

Optional fallback model:

```text
GEMMA_FALLBACK_MODEL=gemma-4-26b-a4b-it
```

The backend retries temporary model availability errors and can fall back to the second Gemma model so a temporary service spike does not immediately become a broken demo.

---

## Project structure

```text
notice2action/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── prompt.ts
│   └── types.ts
├── public/
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

---

## Run locally

### 1. Clone the repository

```bash
git clone https://github.com/Lucky-Quantum/notice2action.git
cd notice2action
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

Create:

```text
.env.local
```

Add:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
GEMMA_MODEL=gemma-4-31b-it
GEMMA_FALLBACK_MODEL=gemma-4-26b-a4b-it
```

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Server-side Gemini API authentication |
| `GEMMA_MODEL` | No | Primary Gemma model |
| `GEMMA_FALLBACK_MODEL` | No | Fallback Gemma model for temporary availability issues |

**Never commit `.env.local` or expose the API key in client-side code.**

---

## Using the MVP

### 1. Tell the app who the tool is for

Enter:

- friend's name
- preferred language
- the real problem you are solving for them

The MVP intentionally leaves the friend name and problem fields empty until the user provides them.

### 2. Add the notice

Choose one:

- PDF
- PNG/JPG/WEBP screenshot
- TXT file
- pasted text

### 3. Analyze with Gemma

The server sends the notice and friend context to Gemma and asks for structured output.

### 4. Review the result

The interface can present:

- deadline
- eligibility status and reasoning
- important points
- eligibility checks
- required/optional documents
- prioritized action plan
- warnings
- extracted key facts
- friend-ready message

---

## AI design

Notice2Action does not use the model as a decorative chat box.

The core AI task is:

```text
raw notice
    ↓
structured facts
    ↓
eligibility reasoning
    ↓
document requirements
    ↓
action prioritization
    ↓
friend-ready communication
```

The prompt instructs the model to:

- avoid inventing missing facts
- distinguish notice facts from assumptions
- avoid claiming eligibility when evidence is insufficient
- return structured JSON
- produce practical next steps
- adapt the final communication to the friend's preferred language

This structure lets the frontend render the AI output as a product workflow rather than as an unstructured paragraph.

---

## Why Gemma / open innovation matters

The model is not a decorative chatbot feature. It is the core transformation from:

**raw notice → structured facts → eligibility reasoning → action plan**

Notice2Action is built around an open-weight Gemma model so this product pattern can be inspected, adapted, and potentially deployed in different environments instead of forcing the product architecture to remain permanently tied to one closed model vendor.

For a small friend-first tool, this matters because the same idea could eventually be adapted for students, universities, community organizations, or other groups that need a simpler way to turn complicated information into practical action.

---

## Safety and limitations

Notice2Action is an **assistant, not an official eligibility authority**.

The model is instructed not to invent missing facts, but AI output can still be incomplete or wrong. Users should always verify important deadlines, eligibility conditions, document requirements, and submission instructions against the original notice or the official issuing organization.

The app should not be used as the sole source of truth for high-stakes decisions.

---

## Demo scenario

The MVP includes a sample **Student Opportunity Fund** notice so the complete workflow can be demonstrated instantly.

For the final challenge demo, replace the sample with a **real notice connected to the friend problem being solved**, after removing private/personal information where necessary.

A strong demo flow is:

```text
Real friend problem
      ↓
Upload notice / screenshot
      ↓
Gemma analysis
      ↓
Deadline + eligibility
      ↓
Documents
      ↓
Action plan
      ↓
Copy message to friend
```

## Repository

**GitHub:**

https://github.com/Lucky-Quantum/notice2action

---

## Official references

- Hacktoberfest Weekend Challenge: https://dev.to/challenges/hacktoberfest-weekend-2026-10-01
- Contest rules: https://dev.to/page/hacktoberfest-weekend-challenge-26-10-01-contest-rules
- Gemma documentation: https://ai.google.dev/gemma/docs

---

## License

MIT — see [`LICENSE`](./LICENSE).

---

<p align="center">
  Built for a friend. Built with open-weight AI. Built to turn information into action.
</p>
