"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToastStore } from "@/store/toastStore";

const RESEND_COUNTDOWN = 60;

function WholesaleForm() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const isSubmitting = useRef(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribe, setSubscribe] = useState(true);

  const [form, setForm] = useState({
    name: "", businessName: "", gstNumber: "", businessAddress: "",
    phone: "", email: "", yearsInBusiness: "", password: "", confirm: "",
  });
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
        password: form.password, role: "wholesaler", subscribe,
        businessName: form.businessName,
        gstNumber: form.gstNumber,
        businessAddress: form.businessAddress,
        yearsInBusiness: form.yearsInBusiness ? Number(form.yearsInBusiness) : null,
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
      addToast("success", "Account created! Your business details are pending verification.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally { setLoading(false); }
  };

  const lbl = { display: "block", fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "8px" };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ width: "100%", maxWidth: "480px", background: "white", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.06)", padding: "48px 40px", boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}>

      {step === 1 && (
        <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6E6E73", textDecoration: "none", marginBottom: "24px" }}>
          <ArrowLeft size={14} /> Back to account type
        </Link>
      )}

      <p style={{ fontSize: "11px", color: "#C9963E", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "10px" }}>
        {step === 1 ? "Business Registration" : "Verify account"}
      </p>
      <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2.2rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "8px", lineHeight: 1.1 }}>
        {step === 1 ? "Wholesaler Registration" : "Enter OTP"}
      </h1>
      <p style={{ fontSize: "14px", color: "#6E6E73", marginBottom: "32px", lineHeight: 1.6 }}>
        {step === 1 ? "Register your wholesale or distribution business." : `We sent a 6-digit code to ${email}`}
      </p>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px" }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />{error}
          </motion.div>
        )}
      </AnimatePresence>

      {step === 1 && (
        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={lbl}>Contact Person Name <span style={{ color: "#f87171" }}>*</span></label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-premium" placeholder="Your full name" required />
          </div>
          <div>
            <label style={lbl}>Business Name <span style={{ color: "#f87171" }}>*</span></label>
            <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="input-premium" placeholder="Your company or trade name" required />
          </div>
          <div>
            <label style={lbl}>GST Number <span style={{ color: "#f87171" }}>*</span></label>
            <input value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })} className="input-premium" placeholder="15-character GST e.g. 22AAAAA0000A1Z5" required maxLength={15} />
            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>15-character GST e.g. 22AAAAA0000A1Z5</p>
          </div>
          <div>
            <label style={lbl}>Business Address <span style={{ color: "#f87171" }}>*</span></label>
            <textarea rows={3} value={form.businessAddress} onChange={(e) => setForm({ ...form, businessAddress: e.target.value })} className="input-premium" placeholder="Registered business address" required />
          </div>
          <div>
            <label style={lbl}>Phone <span style={{ color: "#f87171" }}>*</span></label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-premium" placeholder="10-digit mobile number" required />
          </div>
          <div>
            <label style={lbl}>Email <span style={{ color: "#f87171" }}>*</span></label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-premium" placeholder="you@example.com" required />
          </div>
          <div>
            <label style={lbl}>Years in Business</label>
            <input type="number" min="0" value={form.yearsInBusiness} onChange={(e) => setForm({ ...form, yearsInBusiness: e.target.value })} className="input-premium" placeholder="Optional" />
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
            <span style={{ fontSize: "12px", color: "#6E6E73", lineHeight: 1.5 }}>Subscribe to product updates and exclusive offers</span>
          </label>

          <button type="submit" disabled={loading} className="btn-primary btn-gold" style={{ fontSize: "14px", padding: "14px 20px", opacity: loading ? 0.6 : 1 }}>
            {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Loader2 size={15} className="animate-spin" />Creating account...</span> : "Create Wholesaler Account"}
          </button>
        </form>
      )}

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

export default function WholesalePage() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}>
      <Navbar />
      <main className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "6rem 1.5rem 4rem" }}>
        <WholesaleForm />
      </main>
      <Footer />
    </GoogleReCaptchaProvider>
  );
}
