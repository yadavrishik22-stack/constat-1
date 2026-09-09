"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Clock3, ShieldCheck } from "lucide-react";
import { useStore } from "./store";
import { PublicBrand } from "./public-brand";
import { Button, Field } from "./ui";
import { signupSchema } from "@/lib/auth-models";
import { demoAccounts } from "@/lib/auth-seed";
type FormData = z.infer<typeof signupSchema> & { identifier: string };
export function AuthPage({ signup = false }: { signup?: boolean }) {
  const { auth, ready, authError } = useStore();
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    setError: fieldError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  async function submit(values: FormData) {
    setError("");
    try {
      if (signup) {
        const parsed = signupSchema.safeParse(values);
        if (!parsed.success) {
          for (const issue of parsed.error.issues)
            fieldError(issue.path[0] as keyof FormData, {
              message: issue.message,
            });
          return;
        }
        await auth.signup(parsed.data);
        router.replace("/account-status");
      } else {
        const user = await auth.login(values.identifier, values.password);
        router.replace(
          user.status === "approved" ? "/dashboard" : "/account-status",
        );
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to continue. Please try again.",
      );
    }
  }
  return (
    <main className="auth-layout" id="main-content">
      <aside className="auth-visual">
        <Image
          src="/images/landing/construction.webp"
          alt="Concrete structure and crane at an active construction site"
          fill
          sizes="50vw"
        />
        <div className="auth-visual-content">
          <PublicBrand />
          <div>
            <span className="eyebrow">BUILT FOR THE PEOPLE WHO BUILD.</span>
            <h2>
              Every Site.
              <br />
              Every Stat.
              <br />
              One View.
            </h2>
            <p>
              From the first delivery to the last pour.
              <br />
              Keep your site’s story in one place.
            </p>
          </div>
          <span className="auth-visual-foot">
            CONSTAT / CONSTRUCTION STATISTICS TRACKER
          </span>
        </div>
      </aside>
      <section className="auth-form-area">
        <div className="auth-mobile-brand">
          <PublicBrand />
        </div>
        <div className="auth-form-wrap">
          <Link href="/" className="back-home">
            <ArrowLeft size={15} /> Back to Home
          </Link>
          <span className="eyebrow">YOUR SITE WORKSPACE</span>
          <h1>{signup ? "Join your site team." : "Welcome back."}</h1>
          <p>
            {signup
              ? "Create your account. Your administrator will approve access."
              : "Sign in to see what’s happening on site."}
          </p>
          <form onSubmit={handleSubmit(submit)} noValidate>
            {signup ? (
              <>
                <Field
                  label="Full Name"
                  required
                  error={errors.fullName?.message}
                >
                  <input autoComplete="name" {...register("fullName")} />
                </Field>
                <Field
                  label="Email Address"
                  required
                  error={errors.email?.message}
                >
                  <input
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                  />
                </Field>
                <Field
                  label="Username"
                  required
                  error={errors.username?.message}
                >
                  <input autoComplete="username" {...register("username")} />
                  <small>
                    3–40 letters, numbers, dots, dashes or underscores.
                  </small>
                </Field>
              </>
            ) : (
              <Field
                label="Email or Username"
                required
                error={errors.identifier?.message}
              >
                <input
                  autoComplete="username"
                  {...register("identifier", {
                    required: "Enter your email or username.",
                  })}
                />
              </Field>
            )}
            <Field label="Password" required error={errors.password?.message}>
              <input
                type="password"
                autoComplete={signup ? "new-password" : "current-password"}
                {...register("password", { required: "Enter your password." })}
              />
              {signup && (
                <small>
                  At least 8 characters, with uppercase, lowercase and a number.
                </small>
              )}
            </Field>
            {signup && (
              <Field
                label="Confirm Password"
                required
                error={errors.confirmPassword?.message}
              >
                <input
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
              </Field>
            )}
            {(error || authError) && (
              <p className="error-message" role="alert">
                {error || authError}
              </p>
            )}
            <Button
              type="submit"
              disabled={!ready || !!authError || isSubmitting}
            >
              {isSubmitting
                ? "Please wait…"
                : signup
                  ? "Create Account"
                  : "Login"}
              <ArrowRight size={17} />
            </Button>
          </form>
          <p className="auth-switch">
            {signup ? "Already have an account?" : "Don’t have an account?"}{" "}
            <Link href={signup ? "/login" : "/signup"}>
              {signup ? "Login" : "Sign Up"}
            </Link>
          </p>
          {!signup && (
            <details className="demo-credentials">
              <summary>Demo Credentials</summary>
              {demoAccounts.map((a) => (
                <div key={a.id}>
                  <strong>
                    {a.role === "super_admin" ? "Super Admin" : "Employee"}
                  </strong>
                  <span>
                    {a.email} · {a.username}
                  </span>
                  <code>{a.password}</code>
                </div>
              ))}
            </details>
          )}
          <p className="demo-disclaimer">
            <ShieldCheck size={16} /> Local demo only. Accounts and records stay
            in this browser. This is not production authentication or
            cross-device access.
          </p>
        </div>
      </section>
    </main>
  );
}
export function AccountStatus() {
  const { user, ready, auth, authError } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (ready && !authError) {
      if (!user) router.replace("/login");
      else if (user.status === "approved") router.replace("/dashboard");
    }
  }, [ready, user, authError, router]);
  const [error, setError] = useState("");
  if (!ready || !user)
    return (
      <main className="loading" id="main-content">
        {authError || "Opening your account…"}
      </main>
    );
  const copy =
    user.status === "rejected"
      ? [
          "Account not approved",
          "Your registration was declined. Contact your ConStat administrator for help.",
        ]
      : user.status === "inactive"
        ? [
            "Account inactive",
            "Your account has been deactivated. Contact your administrator to restore access.",
          ]
        : [
            "Account awaiting approval",
            "Your account has been created successfully. A ConStat administrator must approve your account before you can access construction projects.",
          ];
  return (
    <main className="status-page" id="main-content">
      <PublicBrand />
      <section className="status-card">
        <Clock3 size={32} />
        <span className="eyebrow">ACCOUNT STATUS</span>
        <h1>{copy[0]}</h1>
        <p>{copy[1]}</p>
        <p className="muted">
          {user.fullName} · {user.email}
        </p>
        <div className="inline-actions">
          <Button
            onClick={() => {
              try {
                auth.logout();
                router.replace("/login");
              } catch {
                setError("Could not clear the session. Please try again.");
              }
            }}
          >
            Logout
          </Button>
          <Link className="btn btn-secondary" href="/">
            Return Home
          </Link>
        </div>
        {error && <p role="alert">{error}</p>}
      </section>
      <p className="demo-disclaimer">
        Local demo: your administrator must use this same browser to review your
        account.
      </p>
    </main>
  );
}
