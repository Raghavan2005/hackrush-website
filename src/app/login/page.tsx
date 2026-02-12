"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Login() {
  const [teamCode, setTeamCode] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
const [showProblemModal, setShowProblemModal] = useState(false);
const [problems, setProblems] = useState<any[]>([]);
const [selectedProblem, setSelectedProblem] = useState("");

  const handleTeamCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 5);
    setTeamCode(value);
    setError("");
  };
const router = useRouter();

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPasscode(value);
    setError("");
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (teamCode.length !== 5) {
    setError("Team code must be 5 characters");
    return;
  }

  if (passcode.length !== 6) {
    setError("Passcode must be 6 digits");
    return;
  }

  setIsLoading(true);
  setError("");

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamCode,
        passcode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Authentication failed");
    }

    // ✅ CRITICAL: persist token
    localStorage.setItem("token", data.token);
    localStorage.setItem("teamName", data.teamName);

    console.log("Login successful");

    // fetch problem statements
const probRes = await fetch("http://localhost:5000/api/problems", {
  headers: {
    Authorization: `Bearer ${data.token}`,
  },
});

const probData = await probRes.json();
setProblems(probData);
setShowProblemModal(true);


  } catch (err) {
    setError(err instanceof Error ? err.message : "Login failed");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
    {showProblemModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">

      {/* Close Button */}
      <button
        onClick={() => setShowProblemModal(false)}
        className="absolute right-4 top-4 rounded-full p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
        aria-label="Close"
      >
        ✕
      </button>

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
        Select Problem Statement
      </h2>

      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Each problem can be selected by only 2 teams
      </p>

      <select
        value={selectedProblem}
        onChange={(e) => setSelectedProblem(e.target.value)}
        className="mt-4 w-full rounded-lg border px-4 py-3 dark:bg-zinc-800"
      >
        <option value="">-- Select --</option>
        {problems.map(p => (
          <option
            key={p.id}
            value={p.id}
            disabled={p.remaining === 0}
          >
            {p.title} ({p.remaining} slots left)
          </option>
        ))}
      </select>

      <button
        disabled={!selectedProblem}
        onClick={async () => {
          const token = localStorage.getItem("token");

          try {
            const res = await fetch(
              "http://localhost:5000/api/problems/select",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ problemId: selectedProblem }),
              }
            );

            const data = await res.json();

            if (!res.ok) {
              // 🚨 Already selected OR full
              alert(
                data.message ||
                "You have already selected a problem. Redirecting to dashboard."
              );
              router.push("/dashboard");
              return;
            }

            // ✅ Success
            router.push("/dashboard");

          } catch (err) {
            alert("Something went wrong. Please try again.");
          }
        }}
        className="mt-6 w-full rounded-lg bg-zinc-900 py-3 text-white disabled:opacity-50"
      >
        Confirm & Continue
      </button>
    </div>
  </div>
)}


      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Team Login
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Enter your team credentials to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Code Input */}
            <div>
              <label
                htmlFor="teamCode"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Team Code
              </label>
              <input
                id="teamCode"
                type="text"
                value={teamCode}
                onChange={handleTeamCodeChange}
                placeholder="XXXXX"
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-center text-lg font-mono tracking-widest text-zinc-900 placeholder-zinc-400 transition focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-white/10"
                maxLength={5}
                autoComplete="off"
              />
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                5 character code
              </p>
            </div>

            {/* Passcode Input */}
            <div>
              <label
                htmlFor="passcode"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Passcode
              </label>
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={handlePasscodeChange}
                placeholder="••••••"
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-center text-lg font-mono tracking-widest text-zinc-900 placeholder-zinc-400 transition focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-white/10"
                maxLength={6}
                inputMode="numeric"
                autoComplete="off"
              />
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                6 digit PIN
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || teamCode.length !== 5 || passcode.length !== 6}
              className="w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:focus:ring-white dark:focus:ring-offset-black"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Demo Credentials
            </p>
            <div className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              <p>Team Code: <span className="font-mono">DEMO1</span></p>
              <p>Passcode: <span className="font-mono">123456</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}