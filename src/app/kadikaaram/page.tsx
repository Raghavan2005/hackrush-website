"use client";

import { useState, useEffect } from "react";
import Image from 'next/image'
import BgVideo from "@/app/kadikaaram/BgVideo";
export default function Home() {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false,
    beforeStart: false,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      
      // Create start and end times for TODAY
      const startTime = new Date(now); 
      startTime.setHours(9,40, 0, 0); // 9:00 AM today
      
      const endTime = new Date(now);
      endTime.setHours(15, 0, 0, 0); // 3:00 PM today (15:00)

      // If current time is before start time
      if (now < startTime) {
        const diff = startTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeRemaining({
          hours,
          minutes,
          seconds,
          isComplete: false,
          beforeStart: true,
        });
        return;
      }

      // If current time is after end time
      if (now > endTime) {
        setTimeRemaining({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isComplete: true,
          beforeStart: false,
        });
        return;
      }

      // Calculate remaining time until end
      const diff = endTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({
        hours,
        minutes,
        seconds,
        isComplete: false,
        beforeStart: false,
      });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  // Calculate total duration and elapsed time for progress bar
  const totalMinutes = 6 * 60; // 6 hours from 9 AM to 3 PM
  const remainingMinutes = timeRemaining.hours * 60 + timeRemaining.minutes;
  const progressPercentage = ((totalMinutes - remainingMinutes) / totalMinutes) * 100;

  return (
       
<div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
      <div className="w-full max-w-2xl">
     <BgVideo />
        <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900 md:p-12">
          {/* Header */}
              <Image
      src="/logo.png"
      width={300}
      height={300}
      alt="Picture of the author"
      className="mx-auto"
    />
    <br></br>
          <div className="mb-8 mx-auto text-center">
         
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white md:text-3xl">
              {timeRemaining.beforeStart ? "Event Starts In - Hackrush" : "Event Countdown - Hackrush"}
            </h1>
           
          </div>

          {/* Timer Display */}
          {timeRemaining.isComplete ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-6 py-3 dark:bg-green-900/30">
                <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400"></div>
                <span className="font-medium text-green-700 dark:text-green-400">
                  Event Completed for Today
                </span>

              </div>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Next event starts Today at 9:00 AM
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              {/* Hours */}
              <div className="rounded-xl bg-zinc-100 p-6 text-center dark:bg-zinc-800">
                <div className="text-4xl font-bold tabular-nums text-zinc-900 dark:text-white md:text-6xl">
                  {formatNumber(timeRemaining.hours)}
                </div>
                <div className="mt-2 text-sm font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                  Hours
                </div>
              </div>

              {/* Minutes */}
              <div className="rounded-xl bg-zinc-100 p-6 text-center dark:bg-zinc-800">
                <div className="text-4xl font-bold tabular-nums text-zinc-900 dark:text-white md:text-6xl">
                  {formatNumber(timeRemaining.minutes)}
                </div>
                <div className="mt-2 text-sm font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                  Minutes
                </div>
              </div>

              {/* Seconds */}
              <div className="rounded-xl bg-zinc-100 p-6 text-center dark:bg-zinc-800">
                <div className="text-4xl font-bold tabular-nums text-zinc-900 dark:text-white md:text-6xl">
                  {formatNumber(timeRemaining.seconds)}
                </div>
                <div className="mt-2 text-sm font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                  Seconds
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar - Only show during event */}
          {!timeRemaining.isComplete && !timeRemaining.beforeStart && (
            <div className="mt-8">
              <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-full bg-zinc-900 transition-all duration-1000 dark:bg-white"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                ></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>9:00 AM</span>
                <span>3:00 PM</span>
              </div>
            </div>
          )}

          {/* Status Message */}
          <div className="mt-8 text-center">
            {!timeRemaining.isComplete && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {timeRemaining.beforeStart
                  ? "Event hasn't started yet"
                  : timeRemaining.hours === 0 && timeRemaining.minutes < 30
                  ? "Almost there! Less than 30 minutes remaining"
                  : timeRemaining.hours === 0
                  ? "Final hour! Stay focused"
                  : `${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? "s" : ""} remaining until completion`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>

    
  );
}