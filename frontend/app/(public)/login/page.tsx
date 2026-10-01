"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MRI_SVGS } from "@/lib/demo-data";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPassword, requestOTP, verifyOTP } = useAuth();

  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"enter_email" | "enter_otp">("enter_email");
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 60-second cooldown timer for resending OTP
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (cooldown > 0) {
      interval = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await requestOTP(email, "LOGIN");
      setSuccessMsg(`A 6-digit security code has been sent to ${email}.`);
      if (res.demo_otp) {
        setDemoOtpHint(res.demo_otp);
      }
      setStep("enter_otp");
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || "Failed to dispatch verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const user = await verifyOTP(email, otp, "LOGIN");
      router.push(user.role === "Admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await loginWithPassword(email, password);
      router.push(user.role === "Admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid login credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-12 bg-navy-950">
      {/* LEFT SIDE: Brand, MRI Visual & Scientific Mission */}
      <div className="hidden lg:flex lg:col-span-5 bg-navy-900 border-r border-slate-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-accent flex items-center justify-center shadow-glow-blue">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-wider text-white">BrainTumorVision AI</div>
              <div className="text-[10px] text-cyan font-mono">Clinical Decision Support Prototype</div>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <h2 className="text-2xl font-bold text-white">Multimodal MRI Intelligence & Explainability</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engineered to support clinical researchers in identifying intracranial neoplasms across T1, T2, FLAIR, and contrast-enhanced sequences with transparent interpretability.
            </p>
          </div>

          {/* Mini MRI preview card */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-primary font-bold">ACTIVE PROTOCOL:</span>
              <span>BraTS 2023 MultiCenter</span>
            </div>
            <div className="w-full h-44 rounded overflow-hidden relative">
              <img src={MRI_SVGS.T1CE} alt="MRI T1CE Preview" className="w-full h-full object-contain" />
              <img src={MRI_SVGS.GRADCAM} alt="GradCAM" className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-70" />
            </div>
            <div className="text-[10px] text-slate-400 text-center font-mono">
              Salience heatmap computed via Grad-CAM Layer-4 Rectification
            </div>
          </div>
        </div>

        {/* Safety Footer */}
        <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-4">
          <strong className="text-amber-400">Notice:</strong> Research use only. AI outputs require qualified clinical review.
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Sign In to BrainTumorVision AI</h1>
            <p className="text-xs text-slate-400">
              Sign in securely with your personal email address.
            </p>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Auth Method Switcher */}
          <div className="flex bg-navy-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => { setAuthMethod("otp"); setError(null); }}
              className={`flex-1 py-2 font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                authMethod === "otp" ? "bg-primary text-white shadow-glow-blue" : "text-slate-400 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email OTP (Recommended)</span>
            </button>
            <button
              onClick={() => { setAuthMethod("password"); setError(null); }}
              className={`flex-1 py-2 font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                authMethod === "password" ? "bg-primary text-white shadow-glow-blue" : "text-slate-400 hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>
          </div>

          {/* METHOD 1: EMAIL OTP WORKFLOW (User Requirement) */}
          {authMethod === "otp" && (
            <div className="space-y-5">
              {step === "enter_email" ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className="w-full bg-navy-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    <span>Send 6-Digit OTP Code</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">Enter 6-Digit Verification Code</label>
                      <button
                        type="button"
                        onClick={() => setStep("enter_email")}
                        className="text-[11px] text-cyan hover:underline"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="w-full bg-navy-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-lg font-mono font-bold tracking-widest text-center text-cyan placeholder-slate-600 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Code valid for <strong>5 minutes</strong></span>
                      <button
                        type="button"
                        disabled={cooldown > 0 || isLoading}
                        onClick={() => handleSendOTP()}
                        className="text-primary hover:underline disabled:text-slate-600 disabled:no-underline"
                      >
                        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend OTP"}
                      </button>
                    </div>

                    {demoOtpHint && (
                      <div className="p-2 rounded bg-cyan/10 border border-cyan/30 text-[11px] text-cyan font-mono text-center">
                        Development verification code: <strong>{demoOtpHint}</strong>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Verify Code & Enter Platform</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* METHOD 2: PASSWORD LOGIN */}
          {authMethod === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full bg-navy-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <span className="text-[11px] text-slate-500">Use your account password</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-navy-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Sign In with Password</span>
              </button>
            </form>
          )}

          {/* Registration link */}
          <div className="text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
