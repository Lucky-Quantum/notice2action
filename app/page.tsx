"use client";

import { ChangeEvent, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Check, FileText, Image as ImageIcon, Loader2, Sparkles, Upload, X } from "lucide-react";
import type { FriendProfile, NoticeResult } from "@/lib/types";

const SAMPLE_NOTICE = `STUDENT OPPORTUNITY FUND 2026\n\nApplications are invited from undergraduate students for emergency academic support.\n\nEligibility:\n- Currently enrolled as an undergraduate student.\n- Family income must be below INR 3,00,000 per year.\n- Support may be used for tuition, exam, books, or essential academic costs.\n\nRequired documents:\n- College ID card\n- Latest fee receipt\n- Family income certificate\n- Bank account details\n\nApplication deadline: 8 October 2026, 5:00 PM IST.\nApplications submitted after the deadline will not be considered.\n\nSubmit the completed form through the student services portal.`;

const SAMPLE_RESULT: NoticeResult = {
  title: "Student Opportunity Fund 2026",
  one_line: "A financial-support application closes on 8 October at 5:00 PM IST.",
  summary: ["For currently enrolled undergraduate students.", "Family income must be below INR 3,00,000 per year.", "Late applications will not be considered."],
  deadline: { date: "8 October 2026", time: "5:00 PM", timezone: "IST", confidence: "high" },
  eligibility: { status: "likely_eligible", reason: "The demo profile is a currently enrolled undergraduate student and meets the stated income threshold.", checks: ["Undergraduate enrollment", "Income below INR 3,00,000"] },
  documents: [
    { name: "College ID card", required: true, status: "needed" },
    { name: "Latest fee receipt", required: true, status: "needed" },
    { name: "Family income certificate", required: true, status: "needed" },
    { name: "Bank account details", required: true, status: "needed" }
  ],
  action_plan: [
    { priority: "TODAY", task: "Find your latest fee receipt and college ID.", why: "These are explicitly required in the notice." },
    { priority: "NEXT", task: "Check that your income certificate is current.", why: "Income is part of the eligibility condition." },
    { priority: "BEFORE DEADLINE", task: "Submit the completed form through the student services portal before 5:00 PM IST on 8 October.", why: "Late applications are not considered." }
  ],
  warnings: ["The notice does not say how long an income certificate remains valid."],
  friend_message: "Hey! I found a student support fund that you may qualify for. The deadline is 8 Oct, 5 PM IST. You mainly need your college ID, fee receipt, income certificate and bank details. Don't leave the submission to the last day.",
  extracted: [
    { label: "Deadline", value: "8 October 2026, 5:00 PM IST" },
    { label: "Income cap", value: "Below INR 3,00,000/year" },
    { label: "Submission", value: "Student services portal" }
  ]
};

function eligibilityBadge(status: NoticeResult["eligibility"]["status"]) {
  if (status === "likely_eligible") return <span className="badge green">✓ Likely eligible</span>;
  if (status === "possibly_eligible") return <span className="badge amber">◐ Needs a check</span>;
  if (status === "likely_not_eligible") return <span className="badge pink">× Likely not eligible</span>;
  return <span className="badge amber">? Not enough info</span>;
}

export default function Home() {
  const [friend, setFriend] = useState<FriendProfile>({ name: "My friend", situation: "Often misses important opportunities because notices are long, confusing, or buried in chats.", language: "Simple English" });
  const [mode, setMode] = useState<"upload" | "text">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<NoticeResult | null>(null);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0];
    if (next) {
      setFile(next);
      setResult(null);
      setStatus(`${next.name} ready.`);
    }
  }

  async function analyze() {
    if (!file && !text.trim()) {
      setStatus("Add a PDF/image or paste the notice text first.");
      return;
    }
    setStatus("Gemma is reading the notice and building the action plan…");
    setResult(null);
    const form = new FormData();
    form.append("friendName", friend.name);
    form.append("situation", friend.situation);
    form.append("language", friend.language);
    if (file) form.append("file", file);
    if (text.trim()) form.append("text", text);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Analysis failed.");
      setResult(body.result);
      setStatus(`Done with ${body.model}.`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Analysis failed. Check your API key and try again.");
    }
  }

  function loadSample() {
    setText(SAMPLE_NOTICE);
    setFile(null);
    setMode("text");
    setResult(SAMPLE_RESULT);
    setStatus("Demo loaded. Replace this with your own notice before recording the final demo.");
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="site">
      <div className="container">
        <nav className="nav">
          <a className="brand" href="#top"><span className="logo"><Sparkles size={17}/></span>Notice2Action</a>
          <div className="nav-actions"><span className="pill">Built with Gemma 4</span><button className="ghost" onClick={loadSample}>Live demo</button></div>
        </nav>

        <section className="hero" id="top">
          <div>
            <div className="eyebrow">Build for a friend · Hacktoberfest 2026</div>
            <h1>Stop reading notices. Start taking action.</h1>
            <p className="hero-copy">Notice2Action turns a <strong>PDF, screenshot, or pasted notice</strong> into the few things your friend actually needs: deadline, eligibility, documents, warnings, and a step-by-step plan.</p>
            <div className="hero-actions">
              <button className="primary" onClick={() => document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" })}>Try a notice <ArrowRight size={16}/></button>
              <button className="secondary" onClick={loadSample}>See sample →</button>
            </div>
          </div>
          <div className="hero-card">
            <div className="mock-top"><span>INPUT</span><span>OUTPUT</span></div>
            <div className="notice-sheet">
              <div className="mini-label">UNIVERSITY CIRCULAR</div>
              <h3>Scholarship Applications — 2026</h3>
              <div className="notice-line"/><div className="notice-line short"/><div className="notice-line"/><div className="notice-line short"/>
              <span className="notice-badge">DEADLINE: 8 OCT · 5 PM</span>
            </div>
            <div className="arrow"><ArrowDown size={18}/></div>
          </div>
        </section>

        <section className="section" id="workspace">
          <div className="eyebrow">The MVP</div>
          <h2 className="section-title">One upload. One useful plan.</h2>
          <p className="section-sub">Give the AI enough context to care about one person. Then let it do the boring extraction work.</p>

          <div className="workspace">
            <div className="card">
              <h3>1. Who is this for?</h3>
              <p>Set a tiny friend profile. It is used only to tailor the eligibility check and language.</p>
              <div className="row">
                <label><span className="field-label">Friend name</span><input className="input" value={friend.name} onChange={e => setFriend({...friend, name:e.target.value})}/></label>
                <label><span className="field-label">Language</span><select className="input" value={friend.language} onChange={e => setFriend({...friend, language:e.target.value as FriendProfile["language"]})}><option>Simple English</option><option>English</option><option>Hinglish</option></select></label>
              </div>
              <label><span className="field-label">Their problem</span><textarea className="textarea" style={{minHeight:105}} value={friend.situation} onChange={e => setFriend({...friend, situation:e.target.value})}/></label>

              <div className="tabs">
                <button className={`tab ${mode === "upload" ? "active" : ""}`} onClick={() => setMode("upload")}>Upload</button>
                <button className={`tab ${mode === "text" ? "active" : ""}`} onClick={() => setMode("text")}>Paste text</button>
              </div>

              {mode === "upload" ? (
                <>
                  <div className="upload" onClick={() => fileRef.current?.click()}>
                    <input ref={fileRef} type="file" accept="image/*,.pdf,.txt" onChange={handleFile}/>
                    <Upload size={28}/>
                    <strong>Drop or choose a notice</strong>
                    <small>PDF, PNG, JPG, WEBP, or TXT</small>
                  </div>
                  {file && <div className="file-chip"><span style={{display:"flex",gap:8,alignItems:"center"}}><FileText size={16}/>{file.name}</span><button className="ghost" onClick={() => setFile(null)}><X size={14}/></button></div>}
                </>
              ) : (
                <textarea className="textarea" placeholder="Paste the notice here…" value={text} onChange={e => setText(e.target.value)} />
              )}
              <button className="primary analyze" onClick={analyze}>{status.includes("reading") ? <Loader2 size={17} className="spin"/> : <Sparkles size={17}/>} Analyze with Gemma</button>
              <div className="notice-status">{status || "Your API key stays on the server; never expose it in client code."}</div>
            </div>

            <div className="results">
              {!result ? (
                <div className="card" style={{minHeight: 640, display:"grid", placeItems:"center", textAlign:"center"}}>
                  <div>
                    <ImageIcon size={34} color="var(--cyan)"/>
                    <h3 style={{marginTop:15}}>Your action plan appears here.</h3>
                    <p>Try the sample to see the complete flow instantly, or analyze your own notice with Gemma.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="card result-hero">
                    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start"}}><div><div className="eyebrow">For {friend.name}</div><h3 style={{fontSize:30,marginTop:7}}>{result.title}</h3><p style={{marginBottom:0}}>{result.one_line}</p></div>{eligibilityBadge(result.eligibility.status)}</div>
                  </div>
                  <div className="result-grid">
                    <div className="metric"><div className="k">Deadline</div><div className="v">{result.deadline.date || "Not found"}</div><div style={{color:"var(--muted)",marginTop:5}}>{[result.deadline.time,result.deadline.timezone].filter(Boolean).join(" · ")}</div></div>
                    <div className="metric"><div className="k">Eligibility</div><div style={{marginTop:9}}>{eligibilityBadge(result.eligibility.status)}</div><div style={{color:"var(--muted)",marginTop:10,lineHeight:1.5}}>{result.eligibility.reason}</div></div>
                  </div>
                  <div className="card"><h3>What matters</h3><ul className="list">{result.summary.map((item,i)=><li key={i}><Check className="check" size={16}/>{item}</li>)}</ul></div>
                  <div className="card"><h3>Documents</h3><ul className="list">{result.documents.map((d,i)=><li key={i}><Check className="check" size={16}/><span>{d.name}{d.required ? "" : " · optional"}</span></li>)}</ul></div>
                  <div className="card"><h3>Your plan</h3><div className="plan">{result.action_plan.map((p,i)=><div className="plan-item" key={i}><div className="plan-meta"><span>{p.priority}</span><span>STEP {i+1}</span></div><strong>{p.task}</strong><span>{p.why}</span></div>)}</div></div>
                  {result.warnings.length > 0 && <div className="card"><h3>Watch out</h3>{result.warnings.map((w,i)=><div className="warning" key={i} style={{marginTop:i?8:0}}>⚠ {w}</div>)}</div>}
                  <div className="message"><strong style={{display:"block",marginBottom:7}}>Send this to {friend.name}</strong>{result.friend_message}</div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="eyebrow">Why this exists</div>
          <h2 className="section-title">The friend problem is not “I need a chatbot.”</h2>
          <p className="section-sub">It is “I wish someone would tell me what this 6-page notice means for me, what I need, and what I should do next.” Notice2Action is designed around that moment.</p>
          <div className="result-grid" style={{marginTop:24}}>
            <div className="card"><h3>Built around Gemma</h3><p>The core reasoning step is an open-weight Gemma model. The app asks it to extract facts, assess profile fit, identify missing information, and produce a structured action plan rather than a free-form summary.</p></div>
            <div className="card"><h3>Open innovation matters</h3><p>An open-weight model makes this pattern easier to inspect, adapt, self-host, or move between providers. For a small friend-first tool, that means the product architecture does not have to be locked to one closed model vendor.</p></div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-inner">
            <div><a className="brand" href="#top"><span className="logo"><Sparkles size={17}/></span>Notice2Action</a><small style={{display:"block",marginTop:12,maxWidth:620}}>A Hacktoberfest 2026 Weekend Challenge project: Build for a Friend. Built during the challenge window.</small></div>
            <span className="pill">Open-weight AI · Gemma 4 · Next.js</span>
          </div>
        </footer>
      </div>
      <style jsx global>{` .spin { animation: spin 1s linear infinite } @keyframes spin { to { transform: rotate(360deg) } } `}</style>
    </main>
  );
}
