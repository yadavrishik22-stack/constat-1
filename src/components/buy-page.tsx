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
  "Multiple construction sites",
  "Workforce and attendance",
  "Diesel and machinery",
  "Materials and inventory",
  "Site expenses",
  "Daily work and issues",
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
      <div className="buy-overview compact-buy-overview">
        <section className="buy-overview-copy">
          <span className="eyebrow">GET CONSTAT</span>
          <h1>One simple system for your construction company.</h1>
          <p>
            Keep daily site operations organized and see every project clearly.
          </p>
        </section>
        <section className="included-card">
          <span className="eyebrow">WHAT CONSTAT TRACKS</span>
          <h2>Your complete site workspace.</h2>
          <ul>
            {benefits.map((item) => (
              <li key={item}>
                <Check size={15} />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/buy/checkout" className="btn btn-primary">
            Continue to Checkout <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </main>
  );
}

export function CheckoutPage() {
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
      <div className="checkout-layout">
        <section className="checkout-summary">
          <span className="eyebrow">CONSTAT SETUP</span>
          <h1>Start with ConStat.</h1>
          <strong className="checkout-price">₹25,999</strong>
          <p>One ConStat setup for your construction company.</p>
          <ul>
            {[
              "Company workspace",
              "Multiple project support",
              "Admin and employee access",
              "Operational tracking",
            ].map((item) => (
              <li key={item}>
                <Check size={16} /> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="buy-form-card checkout-form-card">
          {complete ? (
            <div className="purchase-success" role="status">
              <CheckCircle2 size={38} />
              <span className="eyebrow">REQUEST RECORDED</span>
              <h2>Thank you.</h2>
              <p>
                Your ConStat setup request has been recorded. Our team will
                contact you shortly.
              </p>
              <Link href="/" className="btn btn-primary">
                Return Home <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <>
              <span className="eyebrow">YOUR DETAILS</span>
              <h2>Request your setup</h2>
              <form onSubmit={handleSubmit(submit)} noValidate>
                <Field
                  label="Company Name"
                  required
                  error={errors.companyName?.message}
                >
                  <input
                    placeholder="Enter company name"
                    autoComplete="organization"
                    {...register("companyName")}
                  />
                </Field>
                <Field
                  label="Full Name"
                  required
                  error={errors.fullName?.message}
                >
                  <input
                    placeholder="Enter your full name"
                    autoComplete="name"
                    {...register("fullName")}
                  />
                </Field>
                <div className="buy-form-row">
                  <Field
                    label="Phone Number"
                    required
                    error={errors.phone?.message}
                  >
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      autoComplete="tel"
                      {...register("phone")}
                    />
                  </Field>
                  <Field
                    label="Email Address"
                    required
                    error={errors.email?.message}
                  >
                    <input
                      type="email"
                      placeholder="Enter email address"
                      autoComplete="email"
                      {...register("email")}
                    />
                  </Field>
                </div>
                <Field
                  label="Number of Sites / Projects"
                  error={errors.projectCount?.message}
                >
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    inputMode="numeric"
                    placeholder="e.g. 3"
                    {...register("projectCount")}
                  />
                </Field>
                <Field label="Notes (optional)" error={errors.notes?.message}>
                  <textarea
                    rows={3}
                    placeholder="Any specific requirement (optional)"
                    {...register("notes")}
                  />
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
