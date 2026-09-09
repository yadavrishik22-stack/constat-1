"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard } from "lucide-react";
import { money } from "@/lib/format";
import {
  DEMO_CARD_CVV,
  DEMO_CARD_EXPIRY,
  DEMO_CARD_NUMBER,
  DEMO_PAYMENT_OTP,
  demoPaymentProvider,
  type DemoCardInput,
} from "@/lib/payment";
import { useStore } from "./store";
import { PublicBrand } from "./public-brand";
import { Button, Field } from "./ui";

type Stage = "card" | "otp";

function PaymentHeader() {
  return (
    <header className="buy-header">
      <PublicBrand />
      <Link href="/buy" className="back-home">
        <ArrowLeft size={15} /> Back to Setup
      </Link>
    </header>
  );
}

export function DemoPaymentPage() {
  const requestId = useSearchParams().get("request") ?? "";
  const { purchaseRequests, purchases, ready } = useStore();
  const request = purchaseRequests.find((item) => item.id === requestId);
  const [stage, setStage] = useState<Stage>("card");
  const [paymentError, setPaymentError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<DemoCardInput>();

  useEffect(() => {
    if (stage === "otp") otpRefs.current[0]?.focus();
  }, [stage]);

  if (!ready) return <main className="loading">Opening demo payment…</main>;

  if (!request)
    return (
      <main className="buy-page light-buy-page" id="main-content">
        <PaymentHeader />
        <section className="payment-missing">
          <span className="eyebrow">PAYMENT REQUEST NOT FOUND</span>
          <h1>Start with your setup details.</h1>
          <p>The demo payment needs a saved ConStat setup request.</p>
          <Link href="/buy" className="btn btn-primary">
            Request Your Setup <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    );

  function submitCard(values: DemoCardInput) {
    setPaymentError("");
    try {
      demoPaymentProvider.validateCard(values);
      reset({ nameOnCard: "", cardNumber: "", expiry: "", cvv: "" });
      setStage("otp");
    } catch (error) {
      if (error instanceof z.ZodError) {
        for (const issue of error.issues) {
          const field = issue.path[0] as keyof DemoCardInput;
          setError(field, { message: issue.message });
        }
        return;
      }
      setPaymentError("Unable to open demo verification.");
    }
  }

  function updateOtp(index: number, input: string) {
    const digit = input.replace(/\D/g, "").slice(-1);
    setOtp((current) =>
      current.map((value, i) => (i === index ? digit : value)),
    );
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function pasteOtp(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;
    setOtp(Array.from({ length: 6 }, (_, index) => digits[index] ?? ""));
    otpRefs.current[Math.min(digits.length, 6) - 1]?.focus();
  }

  function verifyOtp() {
    setPaymentError("");
    try {
      const result = demoPaymentProvider.verifyOtp(otp.join(""));
      setOtp(["", "", "", "", "", ""]);
      if (!request) throw new Error("Purchase request not found.");
      purchases.completeDemoPayment(request.id, result.transactionReference);
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "Unable to verify demo OTP.",
      );
    }
  }

  if (request.paymentStatus === "payment_successful")
    return (
      <main className="buy-page light-buy-page" id="main-content">
        <PaymentHeader />
        <section className="payment-success-page">
          <CheckCircle2 size={42} />
          <span className="eyebrow">DEMO PAYMENT COMPLETE</span>
          <h1>Payment Successful</h1>
          <p>Your ConStat setup request has been received successfully.</p>
          <p className="payment-email-note">
            A verification email will be sent once email delivery is connected.
            For this demo, your setup request has been recorded successfully.
          </p>
          <dl className="payment-receipt">
            <div>
              <dt>Product</dt>
              <dd>ConStat Setup</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{money(request.amount)}</dd>
            </div>
            <div>
              <dt>Payment Status</dt>
              <dd>Successful</dd>
            </div>
            <div>
              <dt>Company</dt>
              <dd>{request.companyName}</dd>
            </div>
            <div>
              <dt>Reference</dt>
              <dd>{request.transactionReference}</dd>
            </div>
          </dl>
          <div className="inline-actions">
            <Link href="/" className="btn btn-primary">
              Return Home <ArrowRight size={17} />
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Go to Login
            </Link>
          </div>
        </section>
      </main>
    );

  return (
    <main className="buy-page light-buy-page" id="main-content">
      <PaymentHeader />
      <div className="demo-payment-layout">
        <section className="payment-order-summary">
          <span className="demo-badge">DEMO / TEST PAYMENT</span>
          <h1>ConStat Demo Payment</h1>
          <p>No real money will be charged.</p>
          <dl>
            <div>
              <dt>Order</dt>
              <dd>ConStat Setup</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{money(request.amount)}</dd>
            </div>
            <div>
              <dt>Company</dt>
              <dd>{request.companyName}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{request.fullName}</dd>
            </div>
          </dl>
        </section>

        <section className="demo-payment-card">
          {stage === "card" ? (
            <>
              <CreditCard size={25} />
              <span className="eyebrow">CARD SIMULATION</span>
              <h2>Payment details</h2>
              <div className="test-payment-details">
                <strong>Test Payment Details</strong>
                <span>This is not a real card.</span>
                <code>{DEMO_CARD_NUMBER}</code>
                <small>
                  Expiry: {DEMO_CARD_EXPIRY} · CVV: {DEMO_CARD_CVV}
                </small>
              </div>
              <form onSubmit={handleSubmit(submitCard)} noValidate>
                <Field
                  label="Name on Card"
                  required
                  error={errors.nameOnCard?.message}
                >
                  <input
                    placeholder="e.g. Ramesh Kumar"
                    autoComplete="off"
                    {...register("nameOnCard", { required: true })}
                  />
                </Field>
                <Field
                  label="Card Number"
                  required
                  error={errors.cardNumber?.message}
                >
                  <input
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    autoComplete="off"
                    {...register("cardNumber", { required: true })}
                  />
                </Field>
                <div className="payment-form-row">
                  <Field label="Expiry" required error={errors.expiry?.message}>
                    <input
                      placeholder="MM / YY"
                      inputMode="numeric"
                      autoComplete="off"
                      {...register("expiry", { required: true })}
                    />
                  </Field>
                  <Field label="CVV" required error={errors.cvv?.message}>
                    <input
                      type="password"
                      placeholder="123"
                      inputMode="numeric"
                      maxLength={4}
                      autoComplete="off"
                      {...register("cvv", { required: true })}
                    />
                  </Field>
                </div>
                {paymentError && (
                  <p className="error-message" role="alert">
                    {paymentError}
                  </p>
                )}
                <Button type="submit">Pay {money(request.amount)}</Button>
              </form>
              <small className="sensitive-data-note">
                Card details are used only in this screen and are never saved.
              </small>
            </>
          ) : (
            <div className="otp-panel">
              <span className="eyebrow">DEMO VERIFICATION</span>
              <h2>Verify Payment</h2>
              <p>Enter the OTP for this test payment. No SMS has been sent.</p>
              <div className="demo-otp-helper">
                Demo OTP: <strong>{DEMO_PAYMENT_OTP}</strong>
              </div>
              <div
                className="otp-inputs"
                onPaste={(event) =>
                  pasteOtp(event.clipboardData.getData("text"))
                }
              >
                {otp.map((value, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    aria-label={`OTP digit ${index + 1}`}
                    value={value}
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(event) => updateOtp(index, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace" && !value && index > 0)
                        otpRefs.current[index - 1]?.focus();
                    }}
                  />
                ))}
              </div>
              {paymentError && (
                <p className="error-message" role="alert">
                  {paymentError}
                </p>
              )}
              <Button onClick={verifyOtp}>Verify OTP</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setOtp(["", "", "", "", "", ""]);
                  setPaymentError("");
                  otpRefs.current[0]?.focus();
                }}
              >
                Resend Demo OTP
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
