import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { 
      setError("All fields are required"); 
      return; 
    }
    try {
      setLoading(true);
      await api.post("/auth/request-otp", { name, email, password });
      navigate("/verify", { state: { email } });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Server error");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#B0C9E5] via-[#F5D488] to-[#EBBDC3] p-4 font-['Poppins'] antialiased">
      <form 
        className="w-full max-w-md bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-[#B0C9E5]/30 space-y-6" 
        onSubmit={handleSubmit}
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#B0C9E5] via-[#F5B488] to-[#DCBA83] bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-[#EBBDC3]/80 text-sm font-medium">Join us and start noting your thoughts</p>
        </div>
        {error && (
          <div className="p-3 bg-[#EBBDC3]/20 border border-[#EBBDC3]/50 text-[#DCBA83] rounded-xl text-sm text-center animate-pulse font-medium">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B0C9E5] w-5 h-5" />
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Full name" 
              className="w-full pl-10 p-4 rounded-xl border-0 bg-[#B0C9E5]/30 focus:bg-white focus:ring-2 focus:ring-[#B0C9E5]/40 text-gray-900 placeholder-[#F5D488]/70 transition-all duration-300 shadow-sm hover:shadow-[#B0C9E5]/20 disabled:opacity-50" 
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#F5D488] w-5 h-5" />
            <input 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Email address" 
              type="email" 
              disabled={loading}
              className="w-full pl-10 p-4 rounded-xl border-0 bg-[#F5D488]/30 focus:bg-white focus:ring-2 focus:ring-[#F5B488]/40 text-gray-900 placeholder-[#DCBA83]/70 transition-all duration-300 shadow-sm hover:shadow-[#F5D488]/20 disabled:opacity-50" 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DCBA83] w-5 h-5" />
            <input 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Password" 
              type="password" 
              disabled={loading}
              className="w-full pl-10 p-4 rounded-xl border-0 bg-[#EBBDC3]/30 focus:bg-white focus:ring-2 focus:ring-[#EBBDC3]/40 text-gray-900 placeholder-[#B0C9E5]/70 transition-all duration-300 shadow-sm hover:shadow-[#EBBDC3]/20 disabled:opacity-50" 
            />
          </div>
          <button
            type="submit"
            disabled={loading || !name || !email || !password}
            className="w-full p-4 bg-gradient-to-r from-[#DCBA83] via-[#F5B488] to-[#EBBDC3] text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#B0C9E5] hover:to-[#F5D488] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      </form>
    </div>
  );
}