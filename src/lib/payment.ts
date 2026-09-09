import { z } from "zod";
import { today } from "./format";

export const DEMO_CARD_NUMBER = "4111 1111 1111 1111";
export const DEMO_CARD_EXPIRY = "12/30";
export const DEMO_CARD_CVV = "123";
export const DEMO_PAYMENT_OTP = "123456";

const cardSchema = z.object({
  nameOnCard: z.string().trim().min(2, "Enter the name shown on the card."),
  cardNumber: z.string().transform((value, context) => {
    const digits = value.replace(/\D/g, "");
    if (!/^\d{16}$/.test(digits) || !passesLuhn(digits)) {
      context.addIssue({
        code: "custom",
        message: "Enter a valid 16-digit demo card number.",
      });
      return z.NEVER;
    }
    return digits;
  }),
  expiry: z
    .string()
    .trim()
    .refine(isFutureExpiry, "Enter a valid future expiry."),
  cvv: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "Enter a valid CVV."),
});

export type DemoCardInput = z.input<typeof cardSchema>;

export interface PaymentProvider {
  readonly mode: "demo";
  validateCard(input: DemoCardInput): void;
  verifyOtp(otp: string): { transactionReference: string };
}

function passesLuhn(value: string) {
  let total = 0;
  let double = false;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    total += digit;
    double = !double;
  }
  return total % 10 === 0;
}

function isFutureExpiry(value: string) {
  const match = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const expiry = new Date(year, month, 1);
  return expiry > new Date();
}

function paymentReference() {
  const date = today().replaceAll("-", "");
  const suffix = globalThis.crypto.randomUUID().slice(0, 4).toUpperCase();
  return `CST-PAY-${date}-${suffix}`;
}

export class DemoPaymentProvider implements PaymentProvider {
  readonly mode = "demo" as const;

  validateCard(input: DemoCardInput) {
    cardSchema.parse(input);
  }

  verifyOtp(otp: string) {
    if (otp !== DEMO_PAYMENT_OTP) throw new Error("Enter the demo OTP 123456.");
    return { transactionReference: paymentReference() };
  }
}

export const demoPaymentProvider = new DemoPaymentProvider();
