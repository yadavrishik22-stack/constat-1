import { describe, expect, it } from "vitest";
import {
  DEMO_PAYMENT_OTP,
  DemoPaymentProvider,
  type DemoCardInput,
} from "../src/lib/payment";

const card: DemoCardInput = {
  nameOnCard: "Ramesh Kumar",
  cardNumber: "4111 1111 1111 1111",
  expiry: "12/30",
  cvv: "123",
};

describe("DemoPaymentProvider", () => {
  it("accepts valid demo card details and returns a safe reference", () => {
    const provider = new DemoPaymentProvider();
    expect(() => provider.validateCard(card)).not.toThrow();
    expect(provider.verifyOtp(DEMO_PAYMENT_OTP).transactionReference).toMatch(
      /^CST-PAY-\d{8}-[A-F0-9]{4}$/,
    );
  });

  it("rejects invalid card and OTP values", () => {
    const provider = new DemoPaymentProvider();
    expect(() =>
      provider.validateCard({ ...card, cardNumber: "1234" }),
    ).toThrow();
    expect(() => provider.verifyOtp("000000")).toThrow(
      "Enter the demo OTP 123456.",
    );
  });
});
