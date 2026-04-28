"use client";

import { useState, useTransition } from "react";
import { subscribeAction } from "@/actions/subscribers";

interface SimpleSubscribeFormProps {
  buttonColor?: string;
  focusColor?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
}

export default function SimpleSubscribeForm({
  buttonColor = "bg-primary",
  focusColor = "focus:border-primary focus:ring-primary",
  placeholder = "your@email.com",
  buttonText = "Notify Me",
  successMessage = "You've been subscribed successfully!"
}: SimpleSubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    
    const formData = new FormData();
    formData.set("email", email);

    startTransition(async () => {
      const result = await subscribeAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
        setEmail("");
      }
    });
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl animate-in fade-in zoom-in duration-300">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-sm font-bold text-green-700">{successMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          placeholder={placeholder}
          required
          disabled={isPending}
          className={`flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none transition-all ${focusColor} disabled:opacity-50`}
        />
        <button
          type="submit"
          disabled={isPending}
          className={`px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 ${buttonColor}`}
        >
          {isPending ? (
            <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            buttonText
          )}
        </button>
      </form>
      {error && (
        <p className="text-xs text-red-500 font-medium mt-2 text-left animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
