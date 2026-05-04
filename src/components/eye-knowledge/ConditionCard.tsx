"use client"

import { useState } from "react"
import { Condition } from "@/lib/eyeKnowledgeData"
import Eye3DModel from "./Eye3DModel"

interface ConditionCardProps {
  condition: Condition
  isActive: boolean
  onClick: () => void
}

export default function ConditionCard({ condition, isActive, onClick }: ConditionCardProps) {
  const [activeTab, setActiveTab] = useState<"symptoms" | "causes" | "treatments" | "prevention">("symptoms")

  const tabs = [
    { id: "symptoms", label: "Symptoms" },
    { id: "causes", label: "Causes" },
    { id: "treatments", label: "Treatments" },
    { id: "prevention", label: "Prevention" }
  ] as const

  const tabData = {
    symptoms: condition.symptoms,
    causes: condition.causes,
    treatments: condition.treatments,
    prevention: condition.prevention
  }

  return (
    <div
      onClick={!isActive ? onClick : undefined}
      style={{
        background: "white",
        borderRadius: 20,
        border: `2px solid ${isActive ? condition.color : "#e5e7eb"}`,
        overflow: "hidden",
        transition: "all 0.3s ease",
        cursor: isActive ? "default" : "pointer",
        boxShadow: isActive ? `0 8px 32px ${condition.color}22` : "0 2px 8px rgba(0,0,0,0.06)"
      }}
    >
      {/* Card header */}
      <div style={{
        background: isActive ? condition.color : "#f9fafb",
        padding: isActive ? "28px 28px 20px" : "20px 24px",
        transition: "all 0.3s"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{
              color: isActive ? "white" : "#1a2744",
              fontSize: isActive ? 22 : 18,
              fontWeight: 700,
              margin: 0,
              marginBottom: 6,
              transition: "all 0.3s"
            }}>
              {condition.name}
            </h3>
            <p style={{
              color: isActive ? "rgba(255,255,255,0.8)" : "#6b7280",
              fontSize: 13,
              margin: 0
            }}>
              {condition.tagline}
            </p>
          </div>
          {!isActive && (
            <span style={{
              background: condition.color,
              color: "white",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600
            }}>
              Learn More
            </span>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isActive && (
        <div style={{ padding: "0 28px 28px" }}>
          {/* 3D Model */}
          <div style={{ margin: "24px 0", display: "flex", justifyContent: "center" }}>
            <Eye3DModel condition={condition.id} />
          </div>

          {/* Description */}
          <p style={{
            color: "#374151",
            fontSize: 15,
            lineHeight: 1.7,
            marginBottom: 24,
            padding: "16px",
            background: "#f9fafb",
            borderRadius: 12,
            borderLeft: `4px solid ${condition.color}`
          }}>
            {condition.description}
          </p>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "none",
                  background: activeTab === tab.id ? condition.color : "#f3f4f6",
                  color: activeTab === tab.id ? "white" : "#6b7280",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            {tabData[activeTab].map((item, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 12,
                marginBottom: i < tabData[activeTab].length - 1 ? 12 : 0,
                alignItems: "flex-start"
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: condition.color,
                  marginTop: 6,
                  flexShrink: 0
                }} />
                <p style={{ color: "#374151", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>

          {/* Fun fact */}
          <div style={{
            background: `${condition.color}11`,
            border: `1px solid ${condition.color}33`,
            borderRadius: 12,
            padding: 16
          }}>
            <p style={{ color: condition.color, fontWeight: 700, fontSize: 12, marginBottom: 6, letterSpacing: "0.1em" }}>
              💡 DID YOU KNOW
            </p>
            <p style={{ color: "#374151", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              {condition.funFact}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
