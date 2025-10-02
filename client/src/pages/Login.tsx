import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window { google: any; }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // Google Sign-In setup
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts?.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (res: any) => {
          try {
            setLoading(true);
            await api.post("/auth/google", { idToken: res.credential });
            nav("/dashboard");
          } catch {
            setErr("Google login failed");
            setLoading(false);
          }
        }
      });

      // Render button with numeric width (Google does not accept %)
      window.google?.accounts?.id.renderButton(
        document.getElementById("gbtn"),
        { theme: "outline", size: "large", width: 300 }
      );
    };
    document.body.appendChild(script);

    return () => script.remove();
  }, [nav]);

  // Email/password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setErr("Please fill all fields");
    try {
      setLoading(true);
      setErr("");
      await api.post("/auth/login", { email, password });
      nav("/dashboard");
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#B0C9E5] via-[#F5D488] to-[#EBBDC3] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-[#B0C9E5]/30 space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#B0C9E5] via-[#F5B488] to-[#DCBA83] bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-[#EBBDC3]/80 text-sm font-medium">Sign in to your Notes account</p>
        </div>

        {err && (
          <div className="p-3 bg-[#EBBDC3]/20 border border-[#EBBDC3]/50 text-[#DCBA83] rounded-xl text-sm text-center animate-pulse font-medium">
            {err}
          </div>
        )}

        <div className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            disabled={loading}
            className="w-full p-4 rounded-xl border-0 bg-[#B0C9E5]/30 focus:bg-white focus:ring-2 focus:ring-[#B0C9E5]/40 text-gray-900 placeholder-[#F5D488]/70 transition-all duration-300 shadow-sm hover:shadow-[#B0C9E5]/20 disabled:opacity-50"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            disabled={loading}
            className="w-full p-4 rounded-xl border-0 bg-[#F5D488]/30 focus:bg-white focus:ring-2 focus:ring-[#F5B488]/40 text-gray-900 placeholder-[#DCBA83]/70 transition-all duration-300 shadow-sm hover:shadow-[#F5D488]/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full p-4 bg-gradient-to-r from-[#DCBA83] via-[#F5B488] to-[#EBBDC3] text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#B0C9E5] hover:to-[#F5D488] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-[#B0C9E5]/30"></div>
          <span className="flex-shrink mx-4 text-[#F5D488]/80 text-xs font-medium">or continue with</span>
          <div className="flex-grow border-t border-[#B0C9E5]/30"></div>
        </div>

        {/* Google Sign-In Button */}
        <div className="flex justify-center py-2">
          <div id="gbtn"></div>
        </div>
      </form>
    </div>
  );
}
