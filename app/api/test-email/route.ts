import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    return NextResponse.json({ error: "RESEND_API_KEY is not set" }, { status: 500 });
  }

  try {
    const resend = new Resend(key);
    const result = await resend.emails.send({
      from: "Ecommerce Academy <onboarding@resend.dev>",
      to: "insidet97@gmail.com",
      subject: "Test email from Ecommerce Academy",
      html: "<p>If you see this, emails are working! 🎉</p>",
    });

    return NextResponse.json({ ok: true, result });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
