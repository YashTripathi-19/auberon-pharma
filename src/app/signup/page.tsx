"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToastStore } from "@/store/toastStore";

type UserRole = "customer" | "wholesaler" | "clinic";
const RESEND_COUNTDOWN = 60;

const ROLE_CARDS: { role: UserRole; icon: React.ReactNode; title: string; desc: string }[] = [
  {
    role: "customer",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: "Customer",
    desc: "Order medicines for personal or family use",
  },
  {
    role: "wholesaler",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    title: "Wholesaler",
    desc: "Bulk orders, competitive margins, direct pricing",
  },
  {
    role: "clinic",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M2 12h20" />
      </svg>
    ),
    title: "Clinic / Hospital",
    desc: "Stock for your practice with clinical support",
  },
];

function SignupForm() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const isSubmitting = useRef(false);

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribe, setSubscribe] = useState(true);

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [resending, setResending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step === 2) {
      setCountdown(RESEND_COUNTDOWN);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => { if (prev <= 1) { clearInterval(timerRef.current!); return 0; } return prev - 1; });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Only selects — navigation happens on Continue button click
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    if (selectedRole === "customer") { setStep(1); return; }
    if (selectedRole === "wholesaler") { router.push("/signup/wholesale"); return; }
    if (selectedRole === "clinic") { router.push("/signup/clinic"); return; }
  };

  const continueLabel = selectedRole === "wholesaler" ? "Continue as Wholesaler"
    : selectedRole === "clinic" ? "Continue as Clinic / Hospital"
    : selectedRole === "customer" ? "Continue as Customer"
    : "Select an account type";

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      addToast("success", "OTP resent — check your email");
      setCountdown(RESEND_COUNTDOWN);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => { if (prev <= 1) { clearInterval(timerRef.current!); return 0; } return prev - 1; });
      }, 1000);
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to resend OTP");
    } finally { setResending(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    isSubmitting.current = true;
    setLoading(true);
    try {
      let recaptchaToken: string | undefined;
      if (executeRecaptcha) {
        try { recaptchaToken = await executeRecaptcha("signup"); }
        catch { console.warn("[signup] reCAPTCHA failed, proceeding without token"); }
      }
      const payload: Record<string, unknown> = {
        name: form.name, email: form.email, phone: form.phone,
        password: form.password, role: "customer", subscribe,
        ...(recaptchaToken ? { recaptchaToken } : {}),
      };
      const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      setEmail(form.email);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally { setLoading(false); isSubmitting.current = false; }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      addToast("success", "Account verified! Please sign in.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally { setLoading(false); }
  };

  const lbl = { display: "block", fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "8px" };

  const stepLabel = step === 0 ? "Create account" : step === 1 ? "Create account" : "Verify account";
  const stepTitle = step === 0 ? "Choose account type" : step === 1 ? "Sign up" : "Enter OTP";
  const stepSub = step === 0 ? "Select how you'll be using Auberon Pharmaceuticals." : step === 1 ? "Create your Auberon account to place orders." : `We sent a 6-digit code to ${email}`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ width: "100%", maxWidth: step === 0 ? "640px" : "420px", background: "white", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.06)", padding: "48px 40px", boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}>

      <p style={{ fontSize: "11px", color: "#C9963E", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "10px" }}>{stepLabel}</p>
      <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2.2rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "8px", lineHeight: 1.1 }}>{stepTitle}</h1>
      <p style={{ fontSize: "14px", color: "#6E6E73", marginBottom: "32px", lineHeight: 1.6 }}>{stepSub}</p>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px" }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />{error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 0 — Role chooser */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {ROLE_CARDS.map((card) => (
              <button key={card.role} type="button" onClick={() => handleRoleSelect(card.role)}
                style={{
                  flex: "1 1 160px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px",
                  padding: "24px", borderRadius: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                  background: selectedRole === card.role ? "#fdf6e3" : "white",
                  border: selectedRole === card.role ? "2px solid #c9933a" : "2px solid transparent",
                  outline: "1px solid rgba(0,0,0,0.08)",
                }}>
                <div style={{ color: selectedRole === card.role ? "#c9933a" : "#6E6E73", transition: "color 0.2s" }}>
                  {card.icon}
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#0B1F3A", marginBottom: "4px" }}>{card.title}</p>
                  <p style={{ fontSize: "12px", color: "#6E6E73", lineHeight: 1.5 }}>{card.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={handleContinue} disabled={!selectedRole} className="btn-primary btn-gold"
            style={{ fontSize: "14px", padding: "14px 20px", width: "100%", marginTop: "8px", opacity: selectedRole ? 1 : 0.4, cursor: selectedRole ? "pointer" : "not-allowed" }}>
            {continueLabel}
          </button>
        </div>
      )}

      {/* Step 1 — Customer form */}
      {step === 1 && (
        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={lbl}>Name <span style={{ color: "#f87171" }}>*</span></label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-premium" placeholder="Your full name" required />
          </div>
          <div>
            <label style={lbl}>Email <span style={{ color: "#f87171" }}>*</span></label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-premium" placeholder="you@example.com" required />
          </div>
          <div>
            <label style={lbl}>Phone <span style={{ color: "#f87171" }}>*</span></label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-premium" placeholder="10-digit mobile number" required />
          </div>
          <div>
            <label style={lbl}>Password <span style={{ color: "#f87171" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-premium" placeholder="Min. 8 characters" required style={{ paddingRight: "44px" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6E6E73" }} aria-label="Toggle password">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label style={lbl}>Confirm Password <span style={{ color: "#f87171" }}>*</span></label>
            <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input-premium" placeholder="Repeat password" required />
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
            <input type="checkbox" checked={subscribe} onChange={(e) => setSubscribe(e.target.checked)}
              style={{ marginTop: "2px", accentColor: "#C9963E", width: "15px", height: "15px", flexShrink: 0, cursor: "pointer" }} />
            <span style={{ fontSize: "12px", color: "#6E6E73", lineHeight: 1.5 }}>Subscribe to product updates, eye health tips, and exclusive offers</span>
          </label>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={() => setStep(0)}
              style={{ padding: "14px 20px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.1)", background: "transparent", fontSize: "14px", fontWeight: 500, color: "#6E6E73", cursor: "pointer", flexShrink: 0 }}>
              Back
            </button>
            <button type="submit" disabled={loading} className="btn-primary btn-gold" style={{ flex: 1, fontSize: "14px", padding: "14px 20px", opacity: loading ? 0.6 : 1 }}>
              {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Loader2 size={15} className="animate-spin" />Creating account...</span> : "Create Account"}
            </button>
          </div>
        </form>
      )}

      {/* Step 2 — OTP */}
      {step === 2 && (
        <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={lbl}>6-Digit OTP <span style={{ color: "#f87171" }}>*</span></label>
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="input-premium" placeholder="000000" maxLength={6} required style={{ fontSize: "1.5rem", letterSpacing: "0.3em", textAlign: "center" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
              <p style={{ fontSize: "12px", color: "#9CA3AF" }}>Code expires in 10 minutes</p>
              {countdown > 0 ? (
                <p style={{ fontSize: "12px", color: "#9CA3AF" }}>Resend in {countdown}s</p>
              ) : (
                <button type="button" onClick={handleResendOtp} disabled={resending}
                  style={{ fontSize: "12px", color: "#C9963E", background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: 0 }}>
                  {resending ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </div>
          </div>
          <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary btn-gold"
            style={{ fontSize: "14px", padding: "14px 20px", width: "100%", opacity: (loading || otp.length !== 6) ? 0.6 : 1 }}>
            {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Loader2 size={15} className="animate-spin" />Verifying...</span> : "Verify Account"}
          </button>
        </form>
      )}

      <p style={{ fontSize: "13px", color: "#6E6E73", textAlign: "center", marginTop: "28px" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "#C9963E", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
      </p>
    </motion.div>
  );
}

export default function SignupPage() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}>
      <Navbar />
      <main className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "6rem 1.5rem 4rem" }}>
        <SignupForm />
      </main>
      <Footer />
    </GoogleReCaptchaProvider>
  );
}
