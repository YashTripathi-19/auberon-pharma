export async function verifyRecaptcha(token: string, minScore = 0.5): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("[recaptcha] RECAPTCHA_SECRET_KEY not set — skipping verification");
    return true;
  }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}`,
    });
    const data = await res.json();
    return data.success === true && (data.score === undefined || data.score >= minScore);
  } catch {
    console.error("[recaptcha] Verification request failed");
    return false;
  }
}
