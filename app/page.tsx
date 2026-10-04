"use client";

import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import {
  ArrowDown,
  ArrowRight,
  Check,
  Clipboard,
  FileText,
  Image as ImageIcon,
  Loader2,
  RefreshCcw,
  Sparkles,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from "lucide-react";

import type { FriendProfile, NoticeResult } from "@/lib/types";

/* =========================================================
   SAMPLE DEMO DATA
   ========================================================= */

const SAMPLE_NOTICE = `STUDENT OPPORTUNITY FUND 2026

Applications are invited from undergraduate students for emergency academic support.

Eligibility:
- Currently enrolled as an undergraduate student.
- Family income must be below INR 3,00,000 per year.
- Support may be used for tuition, exam, books, or essential academic costs.

Required documents:
- College ID card
- Latest fee receipt
- Family income certificate
- Bank account details

Application deadline: 8 October 2026, 5:00 PM IST.
Applications submitted after the deadline will not be considered.

Submit the completed form through the student services portal.`;

const SAMPLE_RESULT: NoticeResult = {
  title: "Student Opportunity Fund 2026",
  one_line:
    "A financial-support application closes on 8 October at 5:00 PM IST.",

  summary: [
    "For currently enrolled undergraduate students.",
    "Family income must be below INR 3,00,000 per year.",
    "Late applications will not be considered.",
  ],

  deadline: {
    date: "8 October 2026",
    time: "5:00 PM",
    timezone: "IST",
    confidence: "high",
  },

  eligibility: {
    status: "likely_eligible",
    reason:
      "The demo profile matches the notice's undergraduate enrollment and income requirements.",
    checks: [
      "Undergraduate enrollment",
      "Income below INR 3,00,000",
    ],
  },

  documents: [
    {
      name: "College ID card",
      required: true,
      status: "needed",
    },
    {
      name: "Latest fee receipt",
      required: true,
      status: "needed",
    },
    {
      name: "Family income certificate",
      required: true,
      status: "needed",
    },
    {
      name: "Bank account details",
      required: true,
      status: "needed",
    },
  ],

  action_plan: [
    {
      priority: "TODAY",
      task: "Find your latest fee receipt and college ID.",
      why: "These are explicitly required in the notice.",
    },
    {
      priority: "NEXT",
      task: "Check that your income certificate is current.",
      why: "Income is part of the eligibility condition.",
    },
    {
      priority: "BEFORE DEADLINE",
      task:
        "Submit the completed form through the student services portal before 5:00 PM IST on 8 October.",
      why: "Late applications are not considered.",
    },
  ],

  warnings: [
    "The notice does not say how long an income certificate remains valid.",
  ],

  friend_message:
    "Hey! I found a student support fund that you may qualify for. The deadline is 8 Oct, 5 PM IST. You mainly need your college ID, fee receipt, income certificate and bank details. Don't leave the submission to the last day.",

  extracted: [
    {
      label: "Deadline",
      value: "8 October 2026, 5:00 PM IST",
    },
    {
      label: "Income cap",
      value: "Below INR 3,00,000/year",
    },
    {
      label: "Submission",
      value: "Student services portal",
    },
  ],
};

/* =========================================================
   HELPERS
   ========================================================= */

function eligibilityBadge(
  status: NoticeResult["eligibility"]["status"]
) {
  if (status === "likely_eligible") {
    return (
      <span className="badge green">
        ✓ Likely eligible
      </span>
    );
  }

  if (status === "possibly_eligible") {
    return (
      <span className="badge amber">
        ◐ Needs a check
      </span>
    );
  }

  if (status === "likely_not_eligible") {
    return (
      <span className="badge pink">
        × Likely not eligible
      </span>
    );
  }

  return (
    <span className="badge amber">
      ? Not enough info
    </span>
  );
}

function documentStatusLabel(status?: string) {
  switch (status) {
    case "ready":
      return "Ready";

    case "missing":
      return "Missing";

    case "needed":
      return "Needed";

    default:
      return "";
  }
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function Home() {
  const [friend, setFriend] = useState<FriendProfile>({
    name: "",
    situation: "",
    language: "Simple English",
  });

  const [mode, setMode] = useState<"upload" | "text">("upload");

  const [file, setFile] = useState<File | null>(null);

  const [text, setText] = useState("");

  const [result, setResult] =
    useState<NoticeResult | null>(null);

  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  /* =======================================================
     FILE HANDLING
     ======================================================= */

  function handleFile(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const next = e.target.files?.[0];

    if (!next) return;

    const maxSize = 10 * 1024 * 1024;

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(next.type)) {
      setStatus(
        "Unsupported file type. Use PDF, PNG, JPG, WEBP, or TXT."
      );

      e.target.value = "";
      return;
    }

    if (next.size > maxSize) {
      setStatus(
        "That file is too large. Please use a file smaller than 10 MB."
      );

      e.target.value = "";
      return;
    }

    setFile(next);
    setText("");
    setResult(null);
    setCopied(false);

    setStatus(`${next.name} is ready for analysis.`);
  }

  function removeFile() {
    setFile(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }

    setStatus("");
  }

  /* =======================================================
     FRIEND PROFILE VALIDATION
     ======================================================= */

  function validateFriendProfile() {
    const name = friend.name.trim();
    const situation = friend.situation.trim();

    if (!name) {
      setStatus(
        "First tell us your friend's name."
      );
      return false;
    }

    if (name.length < 2) {
      setStatus(
        "Please enter a valid friend name."
      );
      return false;
    }

    if (!situation) {
      setStatus(
        "Describe the real problem you're solving for your friend."
      );
      return false;
    }

    if (situation.length < 12) {
      setStatus(
        "Give us a little more detail about your friend's problem."
      );
      return false;
    }

    return true;
  }

  /* =======================================================
     NOTICE VALIDATION
     ======================================================= */

  function validateNotice() {
    if (mode === "upload" && !file) {
      setStatus(
        "Choose a PDF/image/TXT notice first."
      );
      return false;
    }

    if (mode === "text" && !text.trim()) {
      setStatus(
        "Paste the notice text first."
      );
      return false;
    }

    return true;
  }

  /* =======================================================
     GEMMA ANALYSIS
     ======================================================= */

  async function analyze() {
    if (loading) return;

    setCopied(false);
    setStatus("");

    if (!validateFriendProfile()) {
      return;
    }

    if (!validateNotice()) {
      return;
    }

    setLoading(true);
    setResult(null);

    setStatus(
      "Gemma is reading the notice and building a personalized action plan…"
    );

    const form = new FormData();

    form.append(
      "friendName",
      friend.name.trim()
    );

    form.append(
      "situation",
      friend.situation.trim()
    );

    form.append(
      "language",
      friend.language
    );

    if (mode === "upload" && file) {
      form.append("file", file);
    }

    if (mode === "text" && text.trim()) {
      form.append(
        "text",
        text.trim()
      );
    }

    try {
      const res = await fetch(
        "/api/analyze",
        {
          method: "POST",
          body: form,
        }
      );

      let body: {
        result?: NoticeResult;
        model?: string;
        error?: string;
      } = {};

      try {
        body = await res.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!res.ok) {
        throw new Error(
          body.error ||
            "Analysis failed. Please try again."
        );
      }

      if (!body.result) {
        throw new Error(
          "Gemma returned no usable result."
        );
      }

      setResult(body.result);

      setStatus(
        `Done${body.model ? ` with ${body.model}` : ""}.`
      );
    } catch (error) {
      console.error(error);

      setStatus(
        error instanceof Error
          ? error.message
          : "Analysis failed. Check your API key and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     SAMPLE DEMO
     ======================================================= */

  function loadSample() {
    setText(SAMPLE_NOTICE);

    setFile(null);

    setMode("text");

    setResult(SAMPLE_RESULT);

    setCopied(false);

    setStatus(
      "Sample loaded. This is demo data—replace it with a real friend's notice for your final demo."
    );

    setTimeout(() => {
      document
        .getElementById("workspace")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  /* =======================================================
     RESET
     ======================================================= */

  function resetWorkspace() {
    setFriend({
      name: "",
      situation: "",
      language: "Simple English",
    });

    setMode("upload");

    setFile(null);

    setText("");

    setResult(null);

    setStatus("");

    setCopied(false);

    if (fileRef.current) {
      fileRef.current.value = "";
    }

    document
      .getElementById("workspace")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  /* =======================================================
     COPY FRIEND MESSAGE
     ======================================================= */

  async function copyFriendMessage() {
    if (!result?.friend_message) return;

    try {
      await navigator.clipboard.writeText(
        result.friend_message
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2200);
    } catch {
      setStatus(
        "Couldn't copy automatically. You can select the message manually."
      );
    }
  }

  /* =======================================================
     DISPLAY HELPERS
     ======================================================= */

  const friendDisplayName =
    friend.name.trim() || "your friend";

  /* =======================================================
     UI
     ======================================================= */

  return (
    <main className="site">
      <div className="container">

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="nav">
          <a
            className="brand"
            href="#top"
            aria-label="Notice2Action home"
          >
            <span className="logo">
              <Sparkles size={17} />
            </span>

            Notice2Action
          </a>

          <div className="nav-actions">
            <span className="pill">
              Built with Gemma 4
            </span>

            <button
              className="ghost"
              onClick={loadSample}
              type="button"
            >
              Live demo
            </button>
          </div>
        </nav>

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="hero"
          id="top"
        >
          <div>
            <div className="eyebrow">
              Build for a friend · Hacktoberfest 2026
            </div>

            <h1>
              Stop reading notices.
              <br />
              Start taking action.
            </h1>

            <p className="hero-copy">
              Notice2Action turns a{" "}
              <strong>
                PDF, screenshot, or pasted notice
              </strong>{" "}
              into the few things your friend actually
              needs: deadline, eligibility, documents,
              warnings, and a step-by-step plan.
            </p>

            <div className="hero-actions">
              <button
                className="primary"
                onClick={() =>
                  document
                    .getElementById("workspace")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                type="button"
              >
                Try a notice
                <ArrowRight size={16} />
              </button>

              <button
                className="secondary"
                onClick={loadSample}
                type="button"
              >
                See sample →
              </button>
            </div>
          </div>

          <div className="hero-card">
            <div className="mock-top">
              <span>INPUT</span>
              <span>OUTPUT</span>
            </div>

            <div className="notice-sheet">
              <div className="mini-label">
                UNIVERSITY CIRCULAR
              </div>

              <h3>
                Scholarship Applications — 2026
              </h3>

              <div className="notice-line" />
              <div className="notice-line short" />
              <div className="notice-line" />
              <div className="notice-line short" />

              <span className="notice-badge">
                DEADLINE: 8 OCT · 5 PM
              </span>
            </div>

            <div className="arrow">
              <ArrowDown size={18} />
            </div>
          </div>
        </section>

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <section
          className="section"
          id="workspace"
        >
          <div className="eyebrow">
            The MVP
          </div>

          <h2 className="section-title">
            One upload. One useful plan.
          </h2>

          <p className="section-sub">
            Give the AI enough context to care about
            one person. Then let it do the boring
            extraction work.
          </p>

          <div className="workspace">

            {/* =============================================
                LEFT — INPUT
            ============================================= */}

            <div className="card">

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 15,
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3>
                    1. Who is this for?
                  </h3>

                  <p>
                    Set a tiny friend profile.
                    It is used only to tailor
                    the eligibility check and
                    language.
                  </p>
                </div>

                <button
                  className="ghost"
                  type="button"
                  onClick={resetWorkspace}
                  title="Reset workspace"
                  aria-label="Reset workspace"
                >
                  <RefreshCcw size={15} />
                </button>
              </div>

              {/* FRIEND PROFILE */}

              <div className="row">

                <label>
                  <span className="field-label">
                    Friend name
                  </span>

                  <input
                    className="input"
                    type="text"
                    autoComplete="off"
                    placeholder="Enter your friend's name"
                    value={friend.name}
                    onChange={(e) =>
                      setFriend({
                        ...friend,
                        name: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  <span className="field-label">
                    Language
                  </span>

                  <select
                    className="input"
                    value={friend.language}
                    onChange={(e) =>
                      setFriend({
                        ...friend,
                        language:
                          e.target
                            .value as FriendProfile["language"],
                      })
                    }
                  >
                    <option>
                      Simple English
                    </option>

                    <option>
                      English
                    </option>

                    <option>
                      Hinglish
                    </option>
                  </select>
                </label>

              </div>

              <label>
                <span className="field-label">
                  Their problem
                </span>

                <textarea
                  className="textarea"
                  style={{
                    minHeight: 105,
                  }}
                  placeholder="Describe the real problem your friend is facing…"
                  value={friend.situation}
                  onChange={(e) =>
                    setFriend({
                      ...friend,
                      situation: e.target.value,
                    })
                  }
                />
              </label>

              {/* NOTICE SOURCE */}

              <div
                style={{
                  marginTop: 24,
                }}
              >
                <span className="field-label">
                  Notice source
                </span>

                <div className="tabs">

                  <button
                    className={`tab ${
                      mode === "upload"
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setMode("upload");
                      setText("");
                      setResult(null);
                      setStatus("");
                    }}
                    type="button"
                  >
                    Upload
                  </button>

                  <button
                    className={`tab ${
                      mode === "text"
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setMode("text");
                      removeFile();
                      setResult(null);
                      setStatus("");
                    }}
                    type="button"
                  >
                    Paste text
                  </button>

                </div>
              </div>

              {/* UPLOAD */}

              {mode === "upload" ? (
                <>
                  <div
                    className="upload"
                    onClick={() =>
                      fileRef.current?.click()
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" ||
                        e.key === " "
                      ) {
                        e.preventDefault();
                        fileRef.current?.click();
                      }
                    }}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,.pdf,.txt"
                      onChange={handleFile}
                    />

                    <Upload size={28} />

                    <strong>
                      Drop or choose a notice
                    </strong>

                    <small>
                      PDF, PNG, JPG, WEBP, or TXT ·
                      Max 10 MB
                    </small>
                  </div>

                  {file && (
                    <div
                      className="file-chip"
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          minWidth: 0,
                        }}
                      >
                        <FileText size={16} />

                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {file.name}
                        </span>
                      </span>

                      <button
                        className="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        type="button"
                        aria-label="Remove selected file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <textarea
                  className="textarea"
                  style={{
                    minHeight: 220,
                  }}
                  placeholder="Paste the notice here…"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setResult(null);
                  }}
                />
              )}

              {/* ANALYZE */}

              <button
                className="primary analyze"
                onClick={analyze}
                disabled={loading}
                type="button"
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading
                    ? "wait"
                    : "pointer",
                }}
              >
                {loading ? (
                  <Loader2
                    size={17}
                    className="spin"
                  />
                ) : (
                  <Sparkles size={17} />
                )}

                {loading
                  ? "Analyzing…"
                  : "Analyze with Gemma"}
              </button>

              {/* STATUS */}

              <div
                className="notice-status"
                aria-live="polite"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                {loading ? (
                  <Loader2
                    size={14}
                    className="spin"
                    style={{
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                ) : status ? (
                  <AlertCircle
                    size={14}
                    style={{
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <CheckCircle2
                    size={14}
                    style={{
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                )}

                <span>
                  {status ||
                    "Your API key stays on the server; never expose it in client code."}
                </span>
              </div>
            </div>

            {/* =============================================
                RIGHT — RESULTS
            ============================================= */}

            <div className="results">

              {!result ? (
                <div
                  className="card"
                  style={{
                    minHeight: 640,
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <ImageIcon
                      size={34}
                      color="var(--cyan)"
                    />

                    <h3
                      style={{
                        marginTop: 15,
                      }}
                    >
                      Your action plan
                      appears here.
                    </h3>

                    <p>
                      Try the sample to see
                      the complete flow instantly,
                      or analyze your own notice
                      with Gemma.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* RESULT HEADER */}

                  <div className="card result-hero">
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: 18,
                        alignItems:
                          "flex-start",
                      }}
                    >
                      <div>
                        <div className="eyebrow">
                          For{" "}
                          {
                            friendDisplayName
                          }
                        </div>

                        <h3
                          style={{
                            fontSize: 30,
                            marginTop: 7,
                          }}
                        >
                          {result.title}
                        </h3>

                        <p
                          style={{
                            marginBottom: 0,
                          }}
                        >
                          {result.one_line}
                        </p>
                      </div>

                      {
                        eligibilityBadge(
                          result.eligibility
                            .status
                        )
                      }
                    </div>
                  </div>

                  {/* METRICS */}

                  <div className="result-grid">

                    <div className="metric">
                      <div className="k">
                        Deadline
                      </div>

                      <div className="v">
                        {result.deadline
                          ?.date ||
                          "Not found"}
                      </div>

                      <div
                        style={{
                          color:
                            "var(--muted)",
                          marginTop: 5,
                          display: "flex",
                          alignItems:
                            "center",
                          gap: 5,
                        }}
                      >
                        <Clock3 size={13} />

                        {[
                          result.deadline
                            ?.time,
                          result.deadline
                            ?.timezone,
                        ]
                          .filter(Boolean)
                          .join(" · ") ||
                          "No exact time found"}
                      </div>
                    </div>

                    <div className="metric">
                      <div className="k">
                        Eligibility
                      </div>

                      <div
                        style={{
                          marginTop: 9,
                        }}
                      >
                        {
                          eligibilityBadge(
                            result
                              .eligibility
                              .status
                          )
                        }
                      </div>

                      <div
                        style={{
                          color:
                            "var(--muted)",
                          marginTop: 10,
                          lineHeight: 1.5,
                        }}
                      >
                        {
                          result
                            .eligibility
                            .reason
                        }
                      </div>
                    </div>

                  </div>

                  {/* WHAT MATTERS */}

                  <div className="card">
                    <h3>
                      What matters
                    </h3>

                    <ul className="list">
                      {result.summary.map(
                        (item, i) => (
                          <li key={i}>
                            <Check
                              className="check"
                              size={16}
                            />

                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* ELIGIBILITY CHECKS */}

                  {result.eligibility
                    ?.checks
                    ?.length > 0 && (
                    <div className="card">
                      <h3>
                        Eligibility checks
                      </h3>

                      <ul className="list">
                        {result.eligibility.checks.map(
                          (check, i) => (
                            <li key={i}>
                              <Check
                                className="check"
                                size={16}
                              />

                              {check}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* DOCUMENTS */}

                  <div className="card">
                    <h3>
                      Documents
                    </h3>

                    <ul className="list">
                      {result.documents.map(
                        (d, i) => (
                          <li key={i}>
                            <Check
                              className="check"
                              size={16}
                            />

                            <span
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "space-between",
                                gap: 12,
                                width:
                                  "100%",
                              }}
                            >
                              <span>
                                {d.name}
                                {d.required
                                  ? ""
                                  : " · optional"}
                              </span>

                              <span
                                style={{
                                  color:
                                    "var(--muted)",
                                  fontSize: 12,
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {
                                  documentStatusLabel(
                                    d.status
                                  )
                                }
                              </span>
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* ACTION PLAN */}

                  <div className="card">
                    <h3>
                      Your plan
                    </h3>

                    <div className="plan">
                      {result.action_plan.map(
                        (p, i) => (
                          <div
                            className="plan-item"
                            key={i}
                          >
                            <div className="plan-meta">
                              <span>
                                {p.priority}
                              </span>

                              <span>
                                STEP{" "}
                                {i + 1}
                              </span>
                            </div>

                            <strong>
                              {p.task}
                            </strong>

                            <span>
                              {p.why}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* WARNINGS */}

                  {result.warnings.length >
                    0 && (
                    <div className="card">
                      <h3>
                        Watch out
                      </h3>

                      {result.warnings.map(
                        (warning, i) => (
                          <div
                            className="warning"
                            key={i}
                            style={{
                              marginTop:
                                i
                                  ? 8
                                  : 0,
                            }}
                          >
                            ⚠ {warning}
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* EXTRACTED FACTS */}

                  {result.extracted
                    ?.length > 0 && (
                    <div className="card">
                      <h3>
                        Key facts extracted
                      </h3>

                      <div
                        style={{
                          display: "grid",
                          gap: 10,
                          marginTop: 14,
                        }}
                      >
                        {result.extracted.map(
                          (item, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                justifyContent:
                                  "space-between",
                                alignItems:
                                  "flex-start",
                                gap: 16,
                                padding:
                                  "10px 0",
                                borderBottom:
                                  i ===
                                  result
                                    .extracted
                                    .length -
                                    1
                                    ? "none"
                                    : "1px solid var(--border)",
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    "var(--muted)",
                                  fontSize: 13,
                                }}
                              >
                                {item.label}
                              </span>

                              <strong
                                style={{
                                  textAlign:
                                    "right",
                                  fontSize: 14,
                                }}
                              >
                                {item.value}
                              </strong>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* FRIEND MESSAGE */}

                  <div className="message">
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: 14,
                        alignItems:
                          "flex-start",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            display: "block",
                            marginBottom: 7,
                          }}
                        >
                          Send this to{" "}
                          {
                            friendDisplayName
                          }
                        </strong>

                        <span>
                          {
                            result.friend_message
                          }
                        </span>
                      </div>

                      <button
                        className="ghost"
                        onClick={
                          copyFriendMessage
                        }
                        type="button"
                        title="Copy message"
                        aria-label="Copy message"
                        style={{
                          flexShrink: 0,
                        }}
                      >
                        {copied ? (
                          <Check size={15} />
                        ) : (
                          <Clipboard
                            size={15}
                          />
                        )}

                        <span
                          style={{
                            marginLeft: 6,
                          }}
                        >
                          {copied
                            ? "Copied"
                            : "Copy"}
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            WHY THIS EXISTS
        ================================================= */}

        <section className="section">
          <div className="eyebrow">
            Why this exists
          </div>

          <h2 className="section-title">
            The friend problem is not
            “I need a chatbot.”
          </h2>

          <p className="section-sub">
            It is “I wish someone would tell me
            what this 6-page notice means for me,
            what I need, and what I should do next.”
            Notice2Action is designed around that
            moment.
          </p>

          <div
            className="result-grid"
            style={{
              marginTop: 24,
            }}
          >
            <div className="card">
              <h3>
                Built around Gemma
              </h3>

              <p>
                The core reasoning step is an
                open-weight Gemma model. The app asks
                it to extract facts, assess profile
                fit, identify missing information,
                and produce a structured action plan
                rather than a free-form summary.
              </p>
            </div>

            <div className="card">
              <h3>
                Open innovation matters
              </h3>

              <p>
                An open-weight model makes this
                pattern easier to inspect, adapt,
                self-host, or move between providers.
                For a small friend-first tool, that
                means the product architecture does
                not have to be locked to one closed
                model vendor.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="footer">
          <div className="footer-inner">

            <div>
              <a
                className="brand"
                href="#top"
              >
                <span className="logo">
                  <Sparkles size={17} />
                </span>

                Notice2Action
              </a>

              <small
                style={{
                  display: "block",
                  marginTop: 12,
                  maxWidth: 620,
                }}
              >
                A Hacktoberfest 2026 Weekend
                Challenge project: Build for a Friend.
                Built during the challenge window.
              </small>
            </div>

            <span className="pill">
              Open-weight AI · Gemma 4 · Next.js
            </span>

          </div>
        </footer>

      </div>

      {/* ===================================================
          LOCAL ANIMATION
      =================================================== */}

      <style jsx global>{`
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        button:disabled {
          pointer-events: none;
        }

        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
        }
      `}</style>
    </main>
  );
}