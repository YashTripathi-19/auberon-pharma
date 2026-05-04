"use client"

import { useState } from "react"
import { EYE_CONDITIONS, VISION_CORRECTIONS } from "@/lib/eyeKnowledgeData"
import ConditionCard from "@/components/eye-knowledge/ConditionCard"
import VisionCorrectionCard from "@/components/eye-knowledge/VisionCorrectionCard"
import ComparisonTable from "@/components/eye-knowledge/ComparisonTable"

export default function EyeKnowledgeClient() {
  const [activeCondition, setActiveCondition] = useState<string | null>(null)
  const [selectedCorrections, setSelectedCorrections] = useState<string[]>([])
  const [activeSection, setActiveSection] = useState<"conditions" | "correction" | "quiz">("conditions")

  const toggleCorrection = (id: string) => {
    setSelectedCorrections(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const selectedCorrectionData = VISION_CORRECTIONS.filter(c =>
    selectedCorrections.includes(c.id)
  )

  return (
    <div>
      {/* ── HERO ── */}
      <div style={{
        background: "#1a2744",
        padding: "140px 24px 64px",
        textAlign: "center"
      }}>
        <p style={{
          color: "#c9933a",
          fontWeight: 700,
          letterSpacing: "0.15em",
          fontSize: 12,
          textTransform: "uppercase",
          marginBottom: 16
        }}>
          EYE KNOWLEDGE HUB
        </p>
        <h1 style={{
          color: "white",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 700,
          marginBottom: 20,
          lineHeight: 1.2
        }}>
          Understand your eyes.
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 17,
          maxWidth: 600,
          margin: "0 auto 40px",
          lineHeight: 1.7
        }}>
          Interactive guides to common eye conditions, vision correction options,
          and everything you need to protect your sight.
        </p>

        {/* Section nav pills */}
        <div style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          {[
            { id: "conditions", label: "👁 Eye Conditions" },
            { id: "correction", label: "🔬 Vision Correction" },
            { id: "quiz", label: "🧠 Quick Quiz" }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id as typeof activeSection)}
              style={{
                padding: "10px 24px",
                borderRadius: 999,
                border: "2px solid",
                borderColor: activeSection === s.id ? "#c9933a" : "rgba(255,255,255,0.2)",
                background: activeSection === s.id ? "#c9933a" : "transparent",
                color: "white",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONDITIONS SECTION ── */}
      {activeSection === "conditions" && (
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "60px 24px"
        }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{
              color: "#c9933a",
              fontWeight: 700,
              letterSpacing: "0.15em",
              fontSize: 12,
              textTransform: "uppercase",
              marginBottom: 12
            }}>
              LEARN & EXPLORE
            </p>
            <h2 style={{
              color: "#1a2744",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              marginBottom: 16
            }}>
              Common eye conditions.
            </h2>
            <p style={{ color: "#6b7280", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
              Click any condition to explore it with an interactive 3D eye model,
              symptoms, causes, and treatment options.
            </p>
          </div>

          {/* Condition cards grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: activeCondition
              ? "1fr"
              : "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 48
          }}>
            {EYE_CONDITIONS.map(condition => (
              <ConditionCard
                key={condition.id}
                condition={condition}
                isActive={activeCondition === condition.id}
                onClick={() => setActiveCondition(
                  activeCondition === condition.id ? null : condition.id
                )}
              />
            ))}
          </div>

          {/* Back button when expanded */}
          {activeCondition && (
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => setActiveCondition(null)}
                style={{
                  padding: "12px 32px",
                  background: "white",
                  color: "#1a2744",
                  border: "2px solid #1a2744",
                  borderRadius: 999,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 15
                }}
              >
                ← View All Conditions
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── VISION CORRECTION SECTION ── */}
      {activeSection === "correction" && (
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "60px 24px"
        }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{
              color: "#c9933a",
              fontWeight: 700,
              letterSpacing: "0.15em",
              fontSize: 12,
              textTransform: "uppercase",
              marginBottom: 12
            }}>
              COMPARE OPTIONS
            </p>
            <h2 style={{
              color: "#1a2744",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              marginBottom: 16
            }}>
              Glasses, contacts, or surgery?
            </h2>
            <p style={{ color: "#6b7280", fontSize: 16, maxWidth: 540, margin: "0 auto" }}>
              Select up to 3 options to compare them side by side.
              Click a card to select it for comparison.
            </p>
          </div>

          {/* Selection counter */}
          {selectedCorrections.length > 0 && (
            <div style={{
              textAlign: "center",
              marginBottom: 24
            }}>
              <span style={{
                background: "#1a2744",
                color: "white",
                padding: "6px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600
              }}>
                {selectedCorrections.length} selected
                {selectedCorrections.length < 3 ? ` — select ${3 - selectedCorrections.length} more to compare` : " — comparison ready"}
              </span>
              <button
                onClick={() => setSelectedCorrections([])}
                style={{
                  marginLeft: 12,
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Correction cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 48
          }}>
            {VISION_CORRECTIONS.map(correction => (
              <VisionCorrectionCard
                key={correction.id}
                correction={correction}
                isSelected={selectedCorrections.includes(correction.id)}
                onSelect={() => toggleCorrection(correction.id)}
                compareMode={true}
              />
            ))}
          </div>

          {/* Comparison table */}
          {selectedCorrections.length >= 2 && (
            <div>
              <h3 style={{
                color: "#1a2744",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 20,
                textAlign: "center"
              }}>
                Side-by-side comparison
              </h3>
              <div style={{
                background: "white",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
              }}>
                <ComparisonTable corrections={selectedCorrectionData} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── QUICK QUIZ SECTION ── */}
      {activeSection === "quiz" && (
        <QuizSection />
      )}

      {/* ── CTA SECTION ── */}
      <div style={{
        background: "#1a2744",
        padding: "60px 24px",
        textAlign: "center"
      }}>
        <p style={{
          color: "#c9933a",
          fontWeight: 700,
          letterSpacing: "0.15em",
          fontSize: 12,
          textTransform: "uppercase",
          marginBottom: 16
        }}>
          TAKE THE NEXT STEP
        </p>
        <h2 style={{
          color: "white",
          fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
          fontWeight: 700,
          marginBottom: 16
        }}>
          Ready to check your eye health?
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 15,
          maxWidth: 480,
          margin: "0 auto 32px",
          lineHeight: 1.7
        }}>
          Try our free preliminary screening tools or book a professional
          consultation with our ophthalmologists.
        </p>
        <div style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <a href="/eye-tests/colour-blindness" style={{
            padding: "14px 28px",
            background: "#c9933a",
            color: "white",
            borderRadius: 999,
            fontWeight: 600,
            textDecoration: "none",
            fontSize: 15
          }}>
            Colour Blindness Test
          </a>
          <a href="/eye-tests/scan" style={{
            padding: "14px 28px",
            background: "transparent",
            color: "white",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: 999,
            fontWeight: 600,
            textDecoration: "none",
            fontSize: 15
          }}>
            Live Eye Scan
          </a>
          <a href="/hospital#appointment" style={{
            padding: "14px 28px",
            background: "transparent",
            color: "white",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: 999,
            fontWeight: 600,
            textDecoration: "none",
            fontSize: 15
          }}>
            Book Consultation
          </a>
        </div>
      </div>
    </div>
  )
}

// ── QUIZ COMPONENT ──
function QuizSection() {
  const questions = [
    {
      q: "What part of the eye focuses light onto the retina?",
      options: ["Cornea", "Iris", "Lens", "Pupil"],
      answer: "Lens",
      explanation: "The lens is a flexible transparent structure that changes shape to focus light precisely onto the retina for clear vision."
    },
    {
      q: "What causes myopia (nearsightedness)?",
      options: ["Short eyeball", "Long eyeball or steep cornea", "Cloudy lens", "Weak eye muscles"],
      answer: "Long eyeball or steep cornea",
      explanation: "Myopia occurs when the eyeball is too long or the cornea is too curved, causing light to focus in front of the retina instead of on it."
    },
    {
      q: "Which type of conjunctivitis is contagious?",
      options: ["Allergic", "Chemical", "Viral and Bacterial", "None of these"],
      answer: "Viral and Bacterial",
      explanation: "Both viral and bacterial conjunctivitis are highly contagious and spread through direct contact. Allergic conjunctivitis is not contagious."
    },
    {
      q: "What is the most common treatment for cataracts?",
      options: ["Eye drops", "Laser therapy", "Phacoemulsification surgery", "Glasses"],
      answer: "Phacoemulsification surgery",
      explanation: "Phacoemulsification is a surgical procedure where ultrasound waves break up the cloudy lens which is then removed and replaced with an artificial intraocular lens."
    },
    {
      q: "The 20-20-20 rule helps prevent which condition?",
      options: ["Cataract", "Conjunctivitis", "Digital eye strain", "Glaucoma"],
      answer: "Digital eye strain",
      explanation: "Every 20 minutes, look at something 20 feet away for 20 seconds. This relaxes the focusing muscles and reduces digital eye strain from screen use."
    }
  ]

  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleAnswer = (option: string) => {
    if (answered) return
    setSelected(option)
    setAnswered(true)
    setShowExplanation(true)
    if (option === questions[current].answer) {
      setScore(s => s + 1)
    }
  }

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
      setShowExplanation(false)
    } else {
      setFinished(true)
    }
  }

  const reset = () => {
    setCurrent(0)
    setSelected(null)
    setAnswered(false)
    setScore(0)
    setFinished(false)
    setShowExplanation(false)
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div style={{
        maxWidth: 600,
        margin: "60px auto",
        padding: "0 24px 60px",
        textAlign: "center"
      }}>
        <div style={{
          background: "white",
          borderRadius: 20,
          padding: 40,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>
            {percentage >= 80 ? "🏆" : percentage >= 60 ? "👍" : "📚"}
          </div>
          <h2 style={{ color: "#1a2744", marginBottom: 8 }}>
            {score} / {questions.length} correct
          </h2>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>
            {percentage >= 80
              ? "Excellent! You have great eye health knowledge."
              : percentage >= 60
              ? "Good job! A bit more reading and you'll be an expert."
              : "Keep learning — your eye health knowledge is growing!"}
          </p>
          <div style={{
            height: 12,
            background: "#f3f4f6",
            borderRadius: 6,
            marginBottom: 32,
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              width: `${percentage}%`,
              background: percentage >= 80 ? "#16a34a" : percentage >= 60 ? "#c9933a" : "#dc2626",
              borderRadius: 6,
              transition: "width 1s ease"
            }} />
          </div>
          <button
            onClick={reset}
            style={{
              padding: "12px 32px",
              background: "#c9933a",
              color: "white",
              border: "none",
              borderRadius: 999,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 15
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const q = questions[current]

  return (
    <div style={{
      maxWidth: 640,
      margin: "60px auto",
      padding: "0 24px 60px"
    }}>
      {/* Progress */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 8
        }}>
          <span>Question {current + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div style={{
          height: 6,
          background: "#e5e7eb",
          borderRadius: 3,
          overflow: "hidden"
        }}>
          <div style={{
            height: "100%",
            width: `${((current) / questions.length) * 100}%`,
            background: "#c9933a",
            borderRadius: 3,
            transition: "width 0.4s ease"
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{
        background: "white",
        borderRadius: 20,
        padding: 32,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
      }}>
        <h3 style={{
          color: "#1a2744",
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 28,
          lineHeight: 1.5
        }}>
          {q.q}
        </h3>

        {/* Options */}
        <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
          {q.options.map(option => {
            const isCorrect = option === q.answer
            const isSelected = option === selected
            let bg = "white"
            let borderColor = "#e5e7eb"
            let textColor = "#374151"
            if (answered) {
              if (isCorrect) { bg = "#f0fdf4"; borderColor = "#16a34a"; textColor = "#16a34a" }
              else if (isSelected && !isCorrect) { bg = "#fff7f7"; borderColor = "#dc2626"; textColor = "#dc2626" }
            } else if (isSelected) {
              bg = "#fffbeb"; borderColor = "#c9933a"; textColor = "#1a2744"
            }
            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                style={{
                  padding: "14px 20px",
                  borderRadius: 12,
                  border: `2px solid ${borderColor}`,
                  background: bg,
                  color: textColor,
                  textAlign: "left",
                  fontSize: 14,
                  fontWeight: isSelected || (answered && isCorrect) ? 600 : 400,
                  cursor: answered ? "default" : "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>{option}</span>
                {answered && isCorrect && <span>✓</span>}
                {answered && isSelected && !isCorrect && <span>✗</span>}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div style={{
            background: "#f0f4ff",
            borderLeft: "4px solid #1a2744",
            borderRadius: "0 12px 12px 0",
            padding: 16,
            marginBottom: 24
          }}>
            <p style={{
              color: "#1a2744",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.1em",
              marginBottom: 6
            }}>
              EXPLANATION
            </p>
            <p style={{ color: "#374151", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              {q.explanation}
            </p>
          </div>
        )}

        {/* Next button */}
        {answered && (
          <button
            onClick={handleNext}
            style={{
              width: "100%",
              padding: "14px",
              background: "#c9933a",
              color: "white",
              border: "none",
              borderRadius: 999,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 15
            }}
          >
            {current < questions.length - 1 ? "Next Question →" : "See Results"}
          </button>
        )}
      </div>
    </div>
  )
}
