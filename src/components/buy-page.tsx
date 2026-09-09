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

const benefits = [
  "Manage multiple construction sites",
  "Track site workforce",
  "Track diesel and machinery",
  "Track materials and stores",
  "Record site expenses",
  "Monitor daily work and issues",
];

const included = [
  "Company workspace",
  "Project and site management",
  "Employee access",
  "Construction statistics dashboard",
  "Daily operational records",
  "Admin controls",
];

function BuyHeader() {
  return (
    <header className="buy-header">
      <PublicBrand />
      <Link href="/" className="back-home">
        <ArrowLeft size={15} /> Back to Home
      </Link>
    </header>
  );
}

export function BuyPage() {
  return (
    <main className="buy-page light-buy-page" id="main-content">
      <BuyHeader />
      <div className="buy-overview">
        <section className="buy-overview-copy">
          <span className="eyebrow">GET CONSTAT</span>
          <h1>Get ConStat for your construction company.</h1>
          <p>One simple system for daily site operations.</p>
          <ul>
            {benefits.map((item) => (
              <li key={item}>
                <Check size={17} />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="included-card">
          <span className="eyebrow">WHAT&apos;S INCLUDED</span>
          <h2>Your complete site workspace.</h2>
          <ul>
            {included.map((item) => (
              <li key={item}>
                <span />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/buy/pricing" className="btn btn-primary">
            View Pricing <ArrowRight size={18} />
          </Link>
          <small>See the one-time ConStat setup price on the next page.</small>
        </section>
      </div>
    </main>
  );
}

export function PricingPage() {
  return (
    <main className="buy-page light-buy-page" id="main-content">
      <BuyHeader />
      <div className="simple-pricing-layout">
        <div className="pricing-page-intro">
          <span className="eyebrow">CONSTAT PRICING</span>
          <h1>
            One setup.
            <br />
            One clear price.
          </h1>
          <p>No multiple plans or confusing options.</p>
        </div>
        <section className="simple-pricing-card">
          <PublicBrand />
          <p>Construction Statistics Tracker</p>
          <strong>₹25,999</strong>
          <span>One ConStat setup for your construction company.</span>
          <ul>
            {[
              "Company workspace",
              "Multiple project and site support",
              "Admin controls",
              "Employee access",
              "Site statistics",
              "Operational tracking",
            ].map((item) => (
              <li key={item}>
                <Check size={16} />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/buy/request" className="btn btn-primary">
            Get Started <ArrowRight size={18} />
          </Link>
          <Link href="/buy" className="btn btn-secondary">
            Back
          </Link>
        </section>
      </div>
    </main>
  );
}

export function PurchaseRequestPage() {
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
    <main className="buy-page light-buy-page" id="main-content">
      <BuyHeader />
      <div className="request-layout">
        <section className="request-intro">
          <span className="eyebrow">REQUEST CONSTAT</span>
          <h1>Let&apos;s set up your company.</h1>
          <p>Share your details and number of construction sites.</p>
          <Link href="/buy/pricing" className="back-home">
            <ArrowLeft size={15} /> Back to Pricing
          </Link>
        </section>
        <section className="buy-form-card">
          {complete ? (
            <div className="purchase-success" role="status">
              <CheckCircle2 size={38} />
              <span className="eyebrow">REQUEST RECORDED</span>
              <h2>Thank you.</h2>
              <p>
                Your ConStat setup request has been recorded in this browser.
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
              <h2>Your details</h2>
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
                  <Field label="Phone" required error={errors.phone?.message}>
                    <input
                      type="tel"
                      autoComplete="tel"
                      {...register("phone")}
                    />
                  </Field>
                  <Field label="Email" required error={errors.email?.message}>
                    <input
                      type="email"
                      autoComplete="email"
                      {...register("email")}
                    />
                  </Field>
                </div>
                <Field
                  label="Number of Construction Sites"
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
                <Field label="Optional Message" error={errors.notes?.message}>
                  <textarea rows={3} {...register("notes")} />
                </Field>
                {submitError && (
                  <p className="error-message" role="alert">
                    {submitError}
                  </p>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  Request ConStat Setup <ArrowRight size={17} />
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
