"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  CONSTAT_SETUP_AMOUNT,
  purchaseFormSchema,
} from "@/lib/purchase-models";
import { money } from "@/lib/format";
import { useStore } from "./store";
import { PublicBrand } from "./public-brand";
import { Button, Field } from "./ui";

type FormValues = z.input<typeof purchaseFormSchema>;

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
  const router = useRouter();
  const { purchases } = useStore();
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
      const request = purchases.create(parsed.data);
      router.push(`/buy/payment?request=${encodeURIComponent(request.id)}`);
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
      <div className="setup-request-layout">
        <section className="setup-request-intro">
          <span className="eyebrow">REQUEST YOUR SETUP</span>
          <h1>Request Your Setup</h1>
          <p>
            Tell us where to reach you and we&apos;ll set up ConStat for your
            construction company.
          </p>
          <div className="setup-order-summary">
            <PublicBrand />
            <p>Construction Statistics Tracker</p>
            <p className="setup-product-copy">
              One ConStat setup for your construction company.
            </p>
            <div>
              <span>ConStat Setup</span>
              <strong>{money(CONSTAT_SETUP_AMOUNT)}</strong>
            </div>
            <small>One-time setup</small>
            <ul>
              {[
                "Company workspace",
                "Multiple project support",
                "Admin and employee access",
              ].map((item) => (
                <li key={item}>
                  <Check size={15} /> {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="buy-form-card setup-request-form">
          <span className="eyebrow">YOUR DETAILS</span>
          <h2>How can we reach you?</h2>
          <form onSubmit={handleSubmit(submit)} noValidate>
            <Field
              label="Company Name"
              required
              error={errors.companyName?.message}
            >
              <input
                placeholder="Enter your company name"
                autoComplete="organization"
                {...register("companyName")}
              />
            </Field>
            <Field label="Full Name" required error={errors.fullName?.message}>
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
                  placeholder="Enter your phone number"
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
                  placeholder="Enter your email address"
                  autoComplete="email"
                  {...register("email")}
                />
              </Field>
            </div>
            <Field label="Number of Sites" error={errors.projectCount?.message}>
              <input
                type="number"
                min="1"
                max="1000"
                inputMode="numeric"
                placeholder="e.g. 3"
                {...register("projectCount")}
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
        </section>
      </div>
    </main>
  );
}
