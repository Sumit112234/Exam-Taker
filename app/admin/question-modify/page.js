"use client";

import { useState, useCallback } from "react";


// --------------------------NEW--------------------------------

const DIFFICULTY_MAP = { 
  "0": "Easy", 
  "1": "Easy", 
  "2": "Medium", 
  "3": "Hard",
  "Prelims": "Easy",
  "Mains": "Medium",
  "Advanced": "Hard"
};

/** Extract first img src URL from HTML string */
function extractFirstImage(html = "") {
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  return m ? m[1] : undefined;
}

/** Remove <img> tags from HTML — image stored separately */
function removeImgTags(html = "") {
  return html.replace(/<img[^>]*\/?>/gi, "").trim();
}

/** Strip ALL tags — used only for plain-text comparison / preview snippets */
function htmlToPlain(html = "") {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&le;/g, "≤").replace(/&ge;/g, "≥")
    .replace(/&gt;/g, ">").replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&shy;/g, "")
    .trim();
}

/** Resolve answer index → option text (options in source are plain strings) */
function resolveCorrectAnswer(answerIndex, rawOptions) {
  const idx = parseInt(answerIndex, 10);
  if (!isNaN(idx) && rawOptions?.[idx] !== undefined) {
    return htmlToPlain(String(rawOptions[idx]));
  }
  return String(answerIndex);
}

function detectType(q) {
  const plain = htmlToPlain(q.question || "").toLowerCase();
  if (plain.includes("fill in the blank") || !q.options?.length) return "fill-in-the-blank";
  if (q.options?.length === 2) {
    const opts = q.options.map((o) => htmlToPlain(String(o)).toLowerCase());
    if (opts.includes("true") && opts.includes("false")) return "true-false";
  }
  return "mcq";
}

function transformData(rawData) {
  const result = [];
  
  // Ensure rawData is an array
  const sections = Array.isArray(rawData) ? rawData : [rawData];
  
  for (const section of sections) {
    // Support both old format (section_name) and new format (name)
    const sectionName = section.name || section.section_name;
    
    // Support both old format (questions.english) and new format (mock_questions.english)
    const questions = section.mock_questions?.english || 
                     section.questions?.english || 
                     section.mock_questions?.hindi || 
                     section.questions?.hindi || 
                     [];

    for (const q of questions) {
      // Skip if question is empty or undefined
      if (!q || !q.question) continue;
      
      // Options are plain text in source
      const options = (q.options || []).map((o) => htmlToPlain(String(o)));
      const correctAnswer = resolveCorrectAnswer(q.answer, q.options);

      // questionText: preserve HTML (bold, sup/sub, tables…) — strip only <img>
      const questionRaw = q.question || "";
      const questionImage = extractFirstImage(questionRaw);
      const questionText = removeImgTags(questionRaw);

      // passage / common_data: preserve HTML (may contain charts, diagrams)
      const passageRaw = q.common_data || "";
      const passageImage = extractFirstImage(passageRaw);
      const passage = passageRaw ? removeImgTags(passageRaw) : undefined;

      // explanation: preserve HTML (may contain solution images)
      const explRaw = q.explanation || "";
      const explanationImage = extractFirstImage(explRaw);
      const explanation = explRaw ? removeImgTags(explRaw) : undefined;

      // Determine difficulty from level_type field
      let difficulty = DIFFICULTY_MAP[String(q.level_type)] || "Medium";
      
      // Parse marks - handle both string and number formats
      const marks = parseFloat(q.plus_mark) || 1;
      const negativeMarks = parseFloat(q.minus_mark) || 0.25;

      const transformed = {
        sectionName,
        subject: sectionName,
        type: detectType(q),
        // HTML preserved — rendering uses dangerouslySetInnerHTML
        questionText,
        ...(questionImage && { questionImage }),
        ...(passage && { passage }),
        ...(passageImage && { passageImage }),
        options,
        correctAnswer,
        ...(explanation && { explanation }),
        ...(explanationImage && { explanationImage }),
        marks,
        negativeMarks,
        difficulty,
        isActive: q.status !== false && q.status !== "0",
        // internal — stripped on export
        _sourceId: q.id,
        _sno: q.sno,
      };

      result.push(transformed);
    }
  }
  return result;
}



// -----------------------OLD------------------------------





// ─── Transformation Logic ──────────────────────────────────────────────────────

// const DIFFICULTY_MAP = { "0": "Easy", "1": "Easy", "2": "Medium", "3": "Hard" };

// /** Extract first img src URL from HTML string */
// function extractFirstImage(html = "") {
//   const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
//   return m ? m[1] : undefined;
// }

// /** Remove <img> tags from HTML — image stored separately */
// function removeImgTags(html = "") {
//   return html.replace(/<img[^>]*\/?>/gi, "").trim();
// }

// /** Strip ALL tags — used only for plain-text comparison / preview snippets */
// function htmlToPlain(html = "") {
//   return html
//     .replace(/<[^>]*>/g, "")
//     .replace(/&nbsp;/g, " ")
//     .replace(/&le;/g, "≤").replace(/&ge;/g, "≥")
//     .replace(/&gt;/g, ">").replace(/&lt;/g, "<")
//     .replace(/&amp;/g, "&")
//     .replace(/&rsquo;|&lsquo;/g, "'")
//     .replace(/&ldquo;|&rdquo;/g, '"')
//     .replace(/&shy;/g, "")
//     .trim();
// }

// /** Resolve answer index → option text (options in source are plain strings) */
// function resolveCorrectAnswer(answerIndex, rawOptions) {
//   const idx = parseInt(answerIndex, 10);
//   if (!isNaN(idx) && rawOptions?.[idx] !== undefined) {
//     return htmlToPlain(String(rawOptions[idx]));
//   }
//   return String(answerIndex);
// }

// function detectType(q) {
//   const plain = htmlToPlain(q.question || "").toLowerCase();
//   if (plain.includes("fill in the blank") || !q.options?.length) return "fill-in-the-blank";
//   if (q.options?.length === 2) {
//     const opts = q.options.map((o) => htmlToPlain(String(o)).toLowerCase());
//     if (opts.includes("true") && opts.includes("false")) return "true-false";
//   }
//   return "mcq";
// }

// function transformData(rawData) {
//   const result = [];
//   for (const section of rawData) {
//     const sectionName = section.section_name;
//     const questions = section.questions?.english || [];

//     for (const q of questions) {
//       // Options are plain text in source
//       const options = (q.options || []).map((o) => htmlToPlain(String(o)));
//       const correctAnswer = resolveCorrectAnswer(q.answer, q.options);

//       // questionText: preserve HTML (bold, sup/sub, tables…) — strip only <img>
//       const questionRaw = q.question || "";
//       const questionImage = extractFirstImage(questionRaw);
//       const questionText = removeImgTags(questionRaw);

//       // passage / common_data: preserve HTML (may contain charts, diagrams)
//       const passageRaw = q.common_data || "";
//       const passageImage = extractFirstImage(passageRaw);
//       const passage = passageRaw ? removeImgTags(passageRaw) : undefined;

//       // explanation: preserve HTML (may contain solution images)
//       const explRaw = q.explanation || "";
//       const explanationImage = extractFirstImage(explRaw);
//       const explanation = explRaw ? removeImgTags(explRaw) : undefined;

//       const transformed = {
//         sectionName,
//         subject: sectionName,
//         type: detectType(q),
//         // HTML preserved — rendering uses dangerouslySetInnerHTML
//         questionText,
//         ...(questionImage && { questionImage }),
//         ...(passage && { passage }),
//         ...(passageImage && { passageImage }),
//         options,
//         correctAnswer,
//         ...(explanation && { explanation }),
//         ...(explanationImage && { explanationImage }),
//         marks: parseFloat(q.plus_mark) || 1,
//         negativeMarks: parseFloat(q.minus_mark) || 0.25,
//         difficulty: DIFFICULTY_MAP[String(q.level_type)] || "Medium",
//         isActive: q.status !== false,
//         // internal — stripped on export
//         _sourceId: q.id,
//         _sno: q.sno,
//       };

//       result.push(transformed);
//     }
//   }
//   return result;
// }

// ─── UI Helpers ────────────────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <div style={{
      fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em",
      color: "#484848", marginBottom: 5, fontFamily: "monospace",
    }}>
      {children}
    </div>
  );
}

/** Renders preserved HTML + shows extracted image below */
function HtmlBlock({ html, image }) {
  if (!html && !image) return null;
  return (
    <div style={{
      background: "#0c0c0c", border: "1px solid #1e1e1e", borderRadius: 5,
      padding: "10px 12px", fontSize: 13, color: "#ccc", lineHeight: 1.7,
      maxHeight: 280, overflowY: "auto",
    }}>
      {html && <div dangerouslySetInnerHTML={{ __html: html }} style={{ marginBottom: image ? 12 : 0 }} />}
      {image && (
        <div>
          <div style={{ fontSize: 9, color: "#484848", marginBottom: 5, fontFamily: "monospace", letterSpacing: "0.08em" }}>
            ↳ extracted image
          </div>
          <img src={image} alt="" style={{ maxWidth: "100%", borderRadius: 4, border: "1px solid #2a2a2a" }} />
          <div style={{ marginTop: 5, fontSize: 10, color: "#3a6a9a", fontFamily: "monospace", wordBreak: "break-all" }}>
            {image}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: "#0d0d0d", border: `1px solid ${accent}28`,
      borderLeft: `3px solid ${accent}`, borderRadius: 5,
      padding: "12px 15px", minWidth: 90,
    }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: accent, fontFamily: "monospace" }}>{value}</div>
      <div style={{ fontSize: 9, color: "#484848", marginTop: 2, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function Btn({ children, onClick, bg = "#111", color = "#555", style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: bg, color, border: `1px solid ${color}55`,
      borderRadius: 4, padding: "5px 13px", fontSize: 11,
      cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.05em",
      ...style,
    }}>
      {children}
    </button>
  );
}

// ─── Question Row ──────────────────────────────────────────────────────────────

function QuestionRow({ q }) {
  const [open, setOpen] = useState(false);
  const diffColor = { Easy: "#4ade80", Medium: "#facc15", Hard: "#f87171" }[q.difficulty] || "#aaa";
  const snippet = htmlToPlain(q.questionText).slice(0, 108);
  const hasImages = !!(q.questionImage || q.passageImage || q.explanationImage);

  return (
    <div style={{ borderBottom: "1px solid #141414", background: open ? "#0d0d0d" : "transparent" }}>
      {/* collapsed */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "grid", gridTemplateColumns: "40px 1fr 100px 65px 72px 22px 28px",
          alignItems: "center", gap: 10, padding: "10px 16px",
          cursor: "pointer", userSelect: "none",
        }}
      >
        <span style={{ color: "#2e2e2e", fontSize: 10, fontFamily: "monospace" }}>#{q._sno}</span>
        <span style={{ fontSize: 12, color: "#b0b0b0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {snippet}{snippet.length === 108 ? "…" : ""}
        </span>
        <span style={{ fontSize: 10, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {q.sectionName}
        </span>
        <span style={{ fontSize: 10, color: diffColor, textAlign: "center" }}>{q.difficulty}</span>
        <span style={{ fontSize: 10, color: "#4a7aaa", textAlign: "center", fontFamily: "monospace" }}>
          +{q.marks} / -{q.negativeMarks}
        </span>
        {/* image indicator */}
        <span title={hasImages ? "Has images" : "No images"} style={{ fontSize: 12, textAlign: "center", opacity: hasImages ? 1 : 0.15 }}>
          🖼
        </span>
        <span style={{ color: open ? "#60a5fa" : "#333", fontSize: 15, textAlign: "center", display: "inline-block", transition: "transform 0.18s", transform: open ? "rotate(90deg)" : "none" }}>
          ›
        </span>
      </div>

      {/* expanded */}
      {open && (
        <div style={{ padding: "4px 16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Passage block — most likely to contain a chart / pie-chart image */}
          {(q.passage || q.passageImage) && (
            <div>
              <Label>Passage / Common Data {q.passageImage && <span style={{ color: "#fb923c" }}>(image extracted → passageImage)</span>}</Label>
              <HtmlBlock html={q.passage} image={q.passageImage} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* Question */}
            <div>
              <Label>Question Text {q.questionImage && <span style={{ color: "#fb923c" }}>(image → questionImage)</span>}</Label>
              <HtmlBlock html={q.questionText} image={q.questionImage} />
            </div>

            {/* Options */}
            <div>
              <Label>Options</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {q.options.map((opt, i) => {
                  const isCorrect = opt === q.correctAnswer;
                  return (
                    <div key={i} style={{
                      display: "flex", gap: 8, alignItems: "flex-start",
                      padding: "6px 10px", borderRadius: 4, fontSize: 12,
                      background: isCorrect ? "#0d2b1a" : "#111",
                      border: `1px solid ${isCorrect ? "#2a6a3a" : "#1e1e1e"}`,
                      color: isCorrect ? "#4ade80" : "#777",
                    }}>
                      <strong style={{ opacity: 0.4, minWidth: 16 }}>{String.fromCharCode(65 + i)}.</strong>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {isCorrect && <span style={{ fontSize: 9, color: "#4ade80", letterSpacing: "0.07em" }}>✓ CORRECT</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation */}
            {(q.explanation || q.explanationImage) && (
              <div style={{ gridColumn: "1/-1" }}>
                <Label>Explanation {q.explanationImage && <span style={{ color: "#fb923c" }}>(image → explanationImage)</span>}</Label>
                <HtmlBlock html={q.explanation} image={q.explanationImage} />
              </div>
            )}

            {/* All extracted image URLs */}
            {hasImages && (
              <div style={{ gridColumn: "1/-1" }}>
                <Label>Extracted Image URLs → Schema Fields</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[["questionImage", q.questionImage], ["passageImage", q.passageImage], ["explanationImage", q.explanationImage]]
                    .filter(([, v]) => v)
                    .map(([field, url]) => (
                      <div key={field} style={{
                        display: "flex", gap: 10, alignItems: "center",
                        background: "#0c0c0c", border: "1px solid #1e1e1e",
                        borderRadius: 4, padding: "5px 10px",
                      }}>
                        <span style={{ fontSize: 10, color: "#a78bfa", minWidth: 140, fontFamily: "monospace" }}>{field}</span>
                        <a href={url} target="_blank" rel="noreferrer"
                          style={{ fontSize: 10, color: "#4a8acc", wordBreak: "break-all", fontFamily: "monospace" }}>
                          {url}
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Metadata badges */}
            <div style={{ gridColumn: "1/-1" }}>
              <Label>Schema Metadata</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {[["sectionName", q.sectionName], ["subject", q.subject], ["type", q.type],
                  ["marks", q.marks], ["negativeMarks", q.negativeMarks],
                  ["difficulty", q.difficulty], ["isActive", String(q.isActive)]
                ].map(([k, v]) => (
                  <span key={k} style={{ fontSize: 9, fontFamily: "monospace", padding: "3px 8px", borderRadius: 3, background: "#0e1e30", color: "#5090cc" }}>
                    {k}: <span style={{ color: "#80c0e0" }}>{v}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DataConverterPage() {
  const [rawInput, setRawInput] = useState("");
  const [transformed, setTransformed] = useState(null);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("ALL");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);

  const handleConvert = useCallback(() => {
    try {
      const parsed = JSON.parse(rawInput);
      const data = Array.isArray(parsed) ? parsed : [parsed];
      const result = transformData(data);
      setTransformed(result);
      setError("");
      setStep(2);
    } catch (e) {
      setError("Invalid JSON: " + e.message);
    }
  }, [rawInput]);

  const getClean = () =>
    (transformed || []).map(({ _sourceId, _sno, ...rest }) => rest);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(getClean(), null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(getClean(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transformed_questions.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const sections = transformed
    ? ["ALL", ...Array.from(new Set(transformed.map((q) => q.sectionName)))]
    : [];

  const filtered = (transformed || []).filter((q) => {
    const sec = activeSection === "ALL" || q.sectionName === activeSection;
    const txt = !search || htmlToPlain(q.questionText).toLowerCase().includes(search.toLowerCase()) || String(q._sno).includes(search);
    return sec && txt;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#ddd", fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace" }}>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #141414", padding: "16px 26px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#090909", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#60a5fa", display: "inline-block", boxShadow: "0 0 8px #60a5fa88" }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", color: "#fff" }}>SCHEMA TRANSFORMER</span>
          </div>
          <div style={{ fontSize: 9, color: "#333", marginTop: 2, letterSpacing: "0.07em" }}>
            Mock Test JSON → Question Schema · HTML preserved · &lt;img&gt; extracted to image fields
          </div>
        </div>
        {transformed && (
          <div style={{ display: "flex", gap: 7 }}>
            <Btn onClick={() => setStep(step === 1 ? 2 : 1)}>{step === 1 ? "Preview →" : "← Edit"}</Btn>
            <Btn onClick={handleCopy} bg={copied ? "#0d2b1a" : "#0e1e30"} color={copied ? "#4ade80" : "#60a5fa"}>
              {copied ? "✓ Copied" : "Copy JSON"}
            </Btn>
            <Btn onClick={handleDownload} bg="#1a1008" color="#fb923c">↓ Download</Btn>
          </div>
        )}
      </div>

      {/* Step 1 — Input */}
      {step === 1 && (
        <div style={{ padding: "26px", maxWidth: 840, margin: "0 auto" }}>
          <div style={{
            marginBottom: 16, padding: "12px 15px", background: "#0b0f14",
            border: "1px solid #1a2535", borderRadius: 6, fontSize: 11,
            color: "#4a7aaa", lineHeight: 1.9,
          }}>
            <span style={{ color: "#80c0e0", fontWeight: 700 }}>Mapping rules: </span>
            <code style={{ color: "#fde68a" }}>questionText</code> &amp; <code style={{ color: "#fde68a" }}>passage</code> → HTML preserved (
            <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>, <code>&lt;sup&gt;</code>, <code>&lt;table&gt;</code>…){" | "}
            <code style={{ color: "#fb923c" }}>questionImage / passageImage / explanationImage</code> → extracted from <code>&lt;img src="…"&gt;</code>{" | "}
            <code style={{ color: "#aaa" }}>category</code>, <code style={{ color: "#aaa" }}>examName</code> → excluded
          </div>

          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={'[{"section_name": "English Language", "questions": {"english": [...]}}]'}
            style={{
              width: "100%", height: 370, background: "#0b0b0b",
              border: "1px solid #1e1e1e", borderRadius: 6, color: "#bbb",
              fontFamily: "monospace", fontSize: 12, padding: 14,
              resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6,
            }}
          />

          {error && (
            <div style={{ marginTop: 9, padding: "9px 13px", background: "#2a0a0a", border: "1px solid #6a1a1a", borderRadius: 5, color: "#f87171", fontSize: 11 }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 13 }}>
            <Btn
              onClick={handleConvert}
              bg="#0e2040" color="#60a5fa"
              style={{ padding: "8px 22px", fontSize: 12, opacity: rawInput.trim() ? 1 : 0.3, cursor: rawInput.trim() ? "pointer" : "not-allowed" }}
            >
              Transform →
            </Btn>
          </div>
        </div>
      )}

      {/* Step 2 — Preview */}
      {step === 2 && transformed && (
        <div style={{ padding: "20px 26px" }}>
          {/* Stats */}
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 18 }}>
            <StatCard label="Total" value={transformed.length} accent="#60a5fa" />
            {Array.from(new Set(transformed.map((q) => q.sectionName))).map((s) => (
              <StatCard key={s} label={s} value={transformed.filter((q) => q.sectionName === s).length} accent="#a78bfa" />
            ))}
            <StatCard label="With Images" value={transformed.filter((q) => q.questionImage || q.passageImage || q.explanationImage).length} accent="#fb923c" />
            <StatCard label="Easy" value={transformed.filter((q) => q.difficulty === "Easy").length} accent="#4ade80" />
            <StatCard label="Medium" value={transformed.filter((q) => q.difficulty === "Medium").length} accent="#facc15" />
          </div>

          {/* Section filter + search */}
          <div style={{ display: "flex", gap: 7, marginBottom: 11, flexWrap: "wrap", alignItems: "center" }}>
            {sections.map((s) => (
              <Btn key={s} onClick={() => setActiveSection(s)}
                bg={activeSection === s ? "#0e2040" : "#0d0d0d"}
                color={activeSection === s ? "#60a5fa" : "#383838"}
                style={{ padding: "3px 11px" }}
              >
                {s}
              </Btn>
            ))}
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                marginLeft: "auto", background: "#0d0d0d", border: "1px solid #1e1e1e",
                borderRadius: 4, color: "#bbb", fontFamily: "monospace",
                fontSize: 11, padding: "3px 11px", outline: "none", width: 190,
              }}
            />
          </div>

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "40px 1fr 100px 65px 72px 22px 28px",
            gap: 10, padding: "6px 16px", fontSize: 8, color: "#2e2e2e",
            letterSpacing: "0.13em", textTransform: "uppercase", borderBottom: "1px solid #141414",
          }}>
            <span>#</span><span>Question</span><span>Section</span>
            <span style={{ textAlign: "center" }}>Difficulty</span>
            <span style={{ textAlign: "center" }}>Marks</span>
            <span style={{ textAlign: "center" }}>IMG</span>
            <span />
          </div>

          {/* List */}
          <div style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto", border: "1px solid #141414", borderRadius: 5 }}>
            {filtered.length === 0
              ? <div style={{ padding: 40, textAlign: "center", color: "#2e2e2e", fontSize: 12 }}>No questions match.</div>
              : filtered.map((q, i) => <QuestionRow key={q._sourceId || i} q={q} />)
            }
          </div>

          <div style={{ marginTop: 7, fontSize: 9, color: "#2e2e2e" }}>
            {filtered.length} of {transformed.length} questions shown
          </div>
        </div>
      )}
    </div>
  );
}