"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { purchaseFormSchema } from "@/lib/purchase-models";
import { useStore } from "./store";
import { PublicBrand } from "./public-brand";
import { Button, Field } from "./ui";

type FormValues = z.input<typeof purchaseFormSchema>;

export function BuyPage() {
  const { purchases } = useStore();
  const [complete, setComplete] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  function submit(values: FormValues) {
    setSubmitError("");
    const parsed = purchaseFormSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        setError(issue.path[0] as keyof FormValues, { message: issue.message });
      return;
    }
    try {
      purchases.create(parsed.data);
      setComplete(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to record your request.",
      );
    }
  }

  return (
    <main className="buy-page" id="main-content">
      <header className="buy-header">
        <PublicBrand />
        <Link href="/" className="back-home">
          <ArrowLeft size={15} /> Back to Home
        </Link>
      </header>
      <div className="buy-layout">
        <section className="buy-plan">
          <span className="eyebrow">ONE SIMPLE CONSTAT SETUP</span>
          <h1>Start tracking your sites.</h1>
          <p>
            One centralized system for your construction company’s daily
            operations.
          </p>
          <div className="buy-price">
            <strong>₹25,999</strong>
            <span>for your construction company</span>
          </div>
          <ul>
            {[
              "Project-wise tracking",
              "Workforce and daily work visibility",
              "Diesel, machinery and material logs",
              "Store and site expense records",
              "Issue reporting and resolution",
            ].map((feature) => (
              <li key={feature}>
                <Check size={17} />
                {feature}
              </li>
            ))}
          </ul>
          <small>
            No online payment is collected in this beta. Submit your details to
            request setup.
          </small>
        </section>
        <section className="buy-form-card">
          {complete ? (
            <div className="purchase-success" role="status">
              <CheckCircle2 size={38} />
              <span className="eyebrow">REQUEST RECORDED</span>
              <h2>Thank you.</h2>
              <p>
                Your ConStat purchase request has been recorded in this browser.
              </p>
              <div className="inline-actions">
                <Link href="/signup" className="btn btn-primary">
                  Create Account <ArrowRight size={17} />
                </Link>
                <Link href="/" className="btn btn-secondary">
                  Return Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              <span className="eyebrow">REQUEST CONSTAT</span>
              <h2>Tell us about your company.</h2>
              <form onSubmit={handleSubmit(submit)} noValidate>
                <Field
                  label="Company Name"
                  required
                  error={errors.companyName?.message}
                >
                  <input
                    autoComplete="organization"
                    {...register("companyName")}
                  />
                </Field>
                <Field
                  label="Full Name"
                  required
                  error={errors.fullName?.message}
                >
                  <input autoComplete="name" {...register("fullName")} />
                </Field>
                <div className="buy-form-row">
                  <Field label="Email" required error={errors.email?.message}>
                    <input
                      type="email"
                      autoComplete="email"
                      {...register("email")}
                    />
                  </Field>
                  <Field
                    label="Phone Number"
                    required
                    error={errors.phone?.message}
                  >
                    <input
                      type="tel"
                      autoComplete="tel"
                      {...register("phone")}
                    />
                  </Field>
                </div>
                <Field
                  label="Number of Projects / Sites"
                  error={errors.projectCount?.message}
                >
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    inputMode="numeric"
                    {...register("projectCount")}
                  />
                </Field>
                <Field label="Notes (optional)" error={errors.notes?.message}>
                  <textarea rows={3} {...register("notes")} />
                </Field>
                {submitError && (
                  <p className="error-message" role="alert">
                    {submitError}
                  </p>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  Request Setup <ArrowRight size={17} />
                </Button>
              </form>
              <p className="buy-signup-link">
                Already ready to test ConStat?{" "}
                <Link href="/signup">Sign Up</Link>
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
