// Sends OTP via Twilio SMS. Falls back gracefully if env vars not set.
export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("[twilio] TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER not set — skipping SMS");
    return;
  }

  try {
    // Dynamic import so the module is only loaded when env vars are present
    const twilio = (await import("twilio")).default;
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: `Your Auberon Pharmaceuticals verification code is: ${otp}. It expires in 10 minutes.`,
      from: fromNumber,
      to: phone,
    });
  } catch (err) {
    console.error("[twilio] Failed to send SMS:", err);
  }
}
