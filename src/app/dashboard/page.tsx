"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [teamName, setTeamName] = useState("");
  const [hasSpun, setHasSpun] = useState(false);
  const [reward, setReward] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
const [showProblemModal, setShowProblemModal] = useState(false);
const [problems, setProblems] = useState<any[]>([]);
const [selectedProblem, setSelectedProblem] = useState("");
useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    router.replace("/login");
    return;
  }

  const loadDashboard = async () => {
    try {
      const res = await fetch("https://hackadmin.bicrec.in/api/team/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }

      if (res.status === 403) {
        const data = await res.json();

        if (data.code === "PROBLEM_NOT_SELECTED") {
          setShowProblemModal(true);
          setLoading(false);
         // await loadProblems(); // 👈 important
          return;
        }
      }

      const data = await res.json();
      setTeamName(data.teamName);
      setHasSpun(data.hasSpun);
      setReward(data.reward);
      setLoading(false);

    } catch (err) {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  };

  loadDashboard();
}, [router]);


  const spinWheel = async () => {
    if (hasSpun) return;

    setSpinning(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://hackadmin.bicrec.in/api/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      // Artificial delay to let the animation feel real
      setTimeout(() => {
        setReward(data.reward);
        setHasSpun(true);
        setSpinning(false);
      }, 3000);
    } catch (err) {
      setSpinning(false);
      alert("Spin failed. Try again!");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-indigo-500" />
          <p className="text-zinc-400 font-medium animate-pulse">Initializing Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-white p-4">
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
              "https://hackadmin.bicrec.in/api/problems/select",
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
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl p-8 shadow-2xl"
      >
        <header className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Team Dashboard</span>
          <h1 className="text-3xl font-extrabold mt-2 tracking-tight">{teamName}</h1>
        </header>

        {/* Improved Wheel Visual */}
        <div className="relative mb-10 flex justify-center">
          <div className="absolute -top-4 z-10 text-2xl">▼</div> {/* Pointer */}
          <motion.div
            animate={spinning ? { rotate: 360 * 5 } : { rotate: 0 }}
            transition={spinning ? { duration: 3, ease: "circOut" } : { duration: 0 }}
            className={`relative h-56 w-56 rounded-full border-[12px] border-zinc-800 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] flex items-center justify-center bg-zinc-900 overflow-hidden`}
          >
            {/* Inner Wheel Segments (Decorative) */}
            <div className="absolute inset-0 opacity-20" 
                 style={{ background: `conic-gradient(#6366f1 0deg 90deg, transparent 90deg 180deg, #6366f1 180deg 270deg, transparent 270deg 360deg)` }} 
            />
            <span className="text-5xl drop-shadow-md">🎁</span>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {reward && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center"
            >
              <p className="text-indigo-300 text-sm uppercase font-bold tracking-wider">Feature to Be Implemented</p>
              <h2 className="text-2xl font-bold text-white">{reward}</h2>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={spinWheel}
          disabled={hasSpun || spinning}
          className={`group relative w-full overflow-hidden rounded-2xl py-4 font-bold transition-all
            ${hasSpun 
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
              : "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            }`}
        >
          <span className="relative z-10">
            {hasSpun ? "Feature Claimed" : spinning ? "Spinning..." : "Find your Feature"}
          </span>
          {!hasSpun && !spinning && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          )}
        </button>
        
        {hasSpun && (
          <p className="mt-4 text-center text-xs text-zinc-500">
            God Only Give one chance!
          </p>
        )}
      </motion.div>
    </div>
  );
}