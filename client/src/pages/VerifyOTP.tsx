import React, { useState } from "react";
import api from "../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Key, CheckCircle } from 'lucide-react';

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location: any = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!otp) { 
      setError("Please enter the OTP"); 
      return; 
    }
    try {
      setLoading(true);
      setError("");
      await api.post("/auth/verify-otp", { email, otp });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error verifying");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#B0C9E5] via-[#F5D488] to-[#EBBDC3] p-4 font-['Poppins'] antialiased">
      <form 
        className="w-full max-w-md bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-[#B0C9E5]/30 space-y-6" 
        onSubmit={handleVerify}
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#B0C9E5] via-[#F5B488] to-[#DCBA83] bg-clip-text text-transparent">
            Verify OTP
          </h2>
          <p className="text-[#EBBDC3]/80 text-sm font-medium">Enter the code sent to {email}</p>
        </div>
        {error && (
          <div className="p-3 bg-[#EBBDC3]/20 border border-[#EBBDC3]/50 text-[#DCBA83] rounded-xl text-sm text-center animate-pulse font-medium flex items-center justify-center gap-2">
            <Key className="w-4 h-4" />
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DCBA83] w-5 h-5" />
            <input 
              value={otp} 
              onChange={e => setOtp(e.target.value)} 
              placeholder="Enter 6-digit OTP" 
              maxLength={6}
              disabled={loading}
              className="w-full pl-10 p-4 rounded-xl border-0 bg-[#F5D488]/30 focus:bg-white focus:ring-2 focus:ring-[#F5B488]/40 text-gray-900 placeholder-[#B0C9E5]/70 transition-all duration-300 shadow-sm hover:shadow-[#F5D488]/20 disabled:opacity-50" 
            />
          </div>
          <button
            type="submit"
            disabled={loading || !otp}
            className="w-full p-4 bg-gradient-to-r from-[#DCBA83] via-[#F5B488] to-[#EBBDC3] text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#B0C9E5] hover:to-[#F5D488] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Verify OTP
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}