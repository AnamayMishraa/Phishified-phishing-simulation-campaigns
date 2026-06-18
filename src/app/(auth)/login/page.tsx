"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true);
    setError(null);

    try {
      await login({ email: data.email, password: data.password });
      toast.success("Signed in successfully");
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : "Invalid email or password"
          : "Failed to sign in";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-default-border bg-surface p-6 space-y-5">
        <div className="space-y-1 text-center">
          <h1 className="text-lg font-semibold text-text-primary">Welcome back</h1>
          <p className="text-xs text-text-muted">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-text-secondary">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 transition-colors"
            />
            {errors.email && (
              <p className="text-[10px] text-status-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-text-secondary">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 1,
                    message: "Password is required",
                  },
                })}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-default-border bg-void px-3 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] text-status-danger">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-status-danger/30 bg-status-danger/5 p-3">
              <p className="text-xs text-status-danger">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent-blue hover:bg-accent-blue-dim disabled:bg-accent-blue/50 text-white text-sm font-medium py-2.5 flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <><Loader2 className="size-4 animate-spin" /> Signing in...</>
            ) : (
              <><LogIn className="size-4" /> Sign in</>
            )}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-[10px] text-text-muted">
        Protected by industry-standard encryption
      </p>
    </div>
  );
}
