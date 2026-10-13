/**
 * Environment contract for `@arki/payments` (Stripe).
 *
 * Compose this into a consuming app's env via `createEnv({ extends: [paymentsEnv], … })` so every
 * app that ships billing declares the same Stripe variables in one place. Only **provider
 * credentials** live here — app-specific configuration (e.g. which Stripe Price ID is "Pro")
 * belongs in the consuming app's own env, not the shared package.
 */
export declare const env: Readonly<{
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    STRIPE_PUBLISHABLE_KEY?: string | undefined;
}>;
//# sourceMappingURL=env.d.ts.map