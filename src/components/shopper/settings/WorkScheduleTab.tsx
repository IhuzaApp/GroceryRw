import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../hooks/useAuth";
import { Toggle, SelectPicker, Button, Message, Loader } from "rsuite";
import WorkScheduleSkeleton from "./WorkScheduleSkeleton";

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export default function WorkScheduleTab() {
  const { theme } = useTheme();
  const { user, isLoggedIn } = useAuth();
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(true);
  const [hasSchedule, setHasSchedule] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Ref to track if initial fetch has been done
  const initialFetchDone = useRef(false);

  // Days of the week - memoize to prevent recreating on each render
  const days = useRef([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]).current;

  // Time slots - memoize the generation function
  const timeSlots = useCallback(() => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}` : `${i}`;
      slots.push({ label: `${hour}:00`, value: `${hour}:00:00+00` });
      slots.push({ label: `${hour}:30`, value: `${hour}:30:00+00` });
    }
    return slots;
  }, [])();

  // Format time for display and comparison
  const formatTimeForDisplay = useCallback((time: string) => {
    // Handle different time formats from database
    let cleanTime = time;

    // Remove timezone if present (handles both +00:00 and +00 formats)
    if (time.includes("+")) {
      cleanTime = time.split("+")[0];
    }

    // Ensure we have seconds (HH:MM:SS format)
    if (cleanTime.split(":").length === 2) {
      cleanTime = `${cleanTime}:00`;
    }

    // Return in the format expected by SelectPicker (HH:MM:SS+00)
    return `${cleanTime}+00`;
  }, []);

  // Format time for API
  const formatTimeForAPI = useCallback((time: string) => {
    // Handle different time formats
    let cleanTime = time;

    // Remove timezone if present (handles both +00:00 and +00 formats)
    if (time.includes("+")) {
      cleanTime = time.split("+")[0];
    }

    // Ensure we have seconds (HH:MM:SS format)
    if (cleanTime.split(":").length === 2) {
      cleanTime = `${cleanTime}:00`;
    }

    // Return in the format expected by PostgreSQL timetz (HH:MM:SS+00:00)
    return `${cleanTime}+00:00`;
  }, []);

  // Load schedule - only run once on mount
  useEffect(() => {
    const loadSchedule = async () => {
      // Skip if we've already fetched or don't have a user ID
      if (initialFetchDone.current || !user?.id) {
        if (!user?.id) {
          console.error("No user ID found in session");
          setLoadError("Please log in to view your schedule.");
          setScheduleLoading(false);
        }
        return;
      }

      try {
        setScheduleLoading(true);
        setLoadError(null);

        const response = await fetch("/api/queries/shopper-availability", {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.status === 401) {
          setLoadError("Your session has expired. Please log in again.");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Initialize with default values for all days
        const daysMap = new Map();
        days.forEach((day) => {
          daysMap.set(day, {
            day,
            startTime: "09:00:00+00",
            endTime: "17:00:00+00",
            available: day !== "Sunday",
          });
        });

        if (
          data.shopper_availability &&
          Array.isArray(data.shopper_availability)
        ) {
          data.shopper_availability.forEach(
            (slot: {
              day_of_week: number;
              start_time: string;
              end_time: string;
              is_available: boolean;
            }) => {
              const day = days[slot.day_of_week - 1];
              if (day) {
                daysMap.set(day, {
                  day,
                  startTime: formatTimeForAPI(slot.start_time),
                  endTime: formatTimeForAPI(slot.end_time),
                  available: slot.is_available,
                });
              }
            }
          );
        }

        const fullSchedule = Array.from(daysMap.values());

        setSchedule(fullSchedule);
        setHasSchedule(Boolean(data.shopper_availability?.length));
      } catch (err) {
        console.error(
          "Schedule fetch error:",
          err instanceof Error ? err.message : "Unknown error"
        );

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load schedule. Please try again.";
        setLoadError(errorMessage);

        // Set default schedule on error
        const defaultSchedule = days.map((day) => ({
          day,
          startTime: "09:00:00+00",
          endTime: "17:00:00+00",
          available: day !== "Sunday",
        }));
        setSchedule(defaultSchedule);
        setHasSchedule(false);
      } finally {
        setScheduleLoading(false);
        initialFetchDone.current = true;
      }
    };

    loadSchedule();
  }, [days, user?.id, formatTimeForAPI]); // Added formatTimeForAPI to dependencies

  // Handle availability toggle
  const handleAvailabilityToggle = useCallback(
    (day: string, available: boolean) => {
      setSchedule((prev) =>
        prev.map((slot) => (slot.day === day ? { ...slot, available } : slot))
      );
    },
    []
  );

  // Handle time change
  const handleTimeChange = useCallback(
    (day: string, field: "startTime" | "endTime", value: string) => {
      setSchedule((prev) =>
        prev.map((slot) =>
          slot.day === day
            ? { ...slot, [field]: formatTimeForAPI(value || "09:00:00") }
            : slot
        )
      );
    },
    [formatTimeForAPI]
  );

  // Save schedule updates
  const saveScheduleUpdates = useCallback(async () => {
    if (!user?.id) {
      setSaveMessage({
        type: "error",
        text: "Session error. Please try refreshing the page.",
      });
      return;
    }

    setSaveMessage({ type: "info", text: "Saving your schedule..." });

    const formattedSchedule = schedule.map((slot, index) => ({
      day_of_week: index + 1,
      start_time: slot.startTime,
      end_time: slot.endTime,
      is_available: slot.available,
    }));

    try {
      const response = await fetch("/api/shopper/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ schedule: formattedSchedule }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      setSaveMessage({
        type: "success",
        text: "Schedule updated successfully!",
      });
      setHasSchedule(true);
    } catch (err) {
      console.error(
        "Schedule save error:",
        err instanceof Error ? err.message : "Unknown error"
      );
      setSaveMessage({
        type: "error",
        text: "Failed to update schedule. Please try again.",
      });
    }
  }, [user?.id, schedule]);

  // Clear save message after 5 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        setSaveMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  if (loadError) {
    return (
      <div className="p-2 sm:p-4">
        <Message type="error" className="mb-4">
          {loadError}
        </Message>
        <Button appearance="primary" onClick={() => window.location.reload()}>
          Retry Loading
        </Button>
      </div>
    );
  }

  if (scheduleLoading && schedule.length === 0) {
    return <WorkScheduleSkeleton />;
  }

  return (
    <div className="p-0">
      <div className={`p-6 md:p-8 border-b ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.01]'}`}>
        <h3
          className={`mb-1 md:mb-2 text-xl md:text-2xl font-black ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Weekly Availability
        </h3>
        <p
          className={`text-xs md:text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Define your active working windows to receive batch requests.
        </p>

        {saveMessage && (
          <div className="mt-4 md:mt-6">
            <Message
              type={saveMessage.type}
              className={`text-xs md:text-sm rounded-xl border ${
                saveMessage.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                  : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}
              closable
              onClose={() => setSaveMessage(null)}
            >
              {saveMessage.text}
            </Message>
          </div>
        )}
      </div>

      <div className="divide-y divide-transparent">
        {schedule.map((slot, index) => (
          <div
            key={slot.day}
            className={`group px-6 md:px-8 py-5 md:py-6 transition-all duration-300 ${
              slot.available 
                ? theme === 'dark' ? 'bg-white/[0.01]' : 'bg-black/[0.01]'
                : ''
            } ${
              index < schedule.length - 1
                ? `border-b ${
                    theme === "dark" ? "border-white/5" : "border-black/5"
                  }`
                : ""
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl font-bold text-[10px] md:text-xs transition-colors duration-300 ${
                  slot.available 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : theme === 'dark' ? 'bg-white/5 text-gray-500' : 'bg-black/5 text-gray-400'
                }`}>
                  {slot.day.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <span
                    className={`text-base md:text-lg font-bold tracking-tight ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {slot.day}
                  </span>
                  <div className={`text-[10px] md:text-xs mt-0.5 ${slot.available ? 'text-emerald-500' : 'text-gray-500'}`}>
                    {slot.available ? 'Actively receiving batches' : 'Not available for orders'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 md:gap-8">
                {slot.available && (
                  <div className="flex items-center gap-2 md:gap-3 bg-transparent p-0 rounded-2xl">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <div className="flex flex-col min-w-[80px] md:min-w-[128px]">
                        <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1 mb-1">Start</span>
                        <div className={`relative transition-all duration-300 rounded-xl overflow-hidden border ${
                          theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'
                        } hover:border-emerald-500/50`}>
                          <SelectPicker
                            data={timeSlots}
                            value={formatTimeForDisplay(slot.startTime)}
                            onChange={(value) =>
                              handleTimeChange(
                                slot.day,
                                "startTime",
                                value || "09:00:00"
                              )
                            }
                            cleanable={false}
                            searchable={false}
                            appearance="subtle"
                            className="w-full border-none ring-0 shadow-none hover:bg-transparent"
                            menuStyle={{ zIndex: 1060 }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-gray-500 font-light px-0.5 md:px-1">→</div>
                      <div className="flex flex-col min-w-[80px] md:min-w-[128px]">
                        <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1 mb-1">End</span>
                        <div className={`relative transition-all duration-300 rounded-xl overflow-hidden border ${
                          theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'
                        } hover:border-emerald-500/50`}>
                          <SelectPicker
                            data={timeSlots}
                            value={formatTimeForDisplay(slot.endTime)}
                            onChange={(value) =>
                              handleTimeChange(slot.day, "endTime", value || "17:00:00")
                            }
                            cleanable={false}
                            searchable={false}
                            appearance="subtle"
                            className="w-full border-none ring-0 shadow-none hover:bg-transparent"
                            menuStyle={{ zIndex: 1060 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <Toggle
                  checked={slot.available}
                  onChange={(checked) =>
                    handleAvailabilityToggle(slot.day, checked)
                  }
                  size={isMobile ? "md" : "lg"}
                  className="custom-toggle"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`p-6 md:p-8 mt-4 flex flex-col sm:flex-row gap-4 justify-between items-center ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-black/[0.01]'}`}>
        <p className={`text-[10px] md:text-xs font-medium text-center sm:text-left ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          * Changes take effect immediately after saving.
        </p>
        <button
          onClick={saveScheduleUpdates}
          disabled={scheduleLoading}
          className={`group relative w-full sm:w-auto px-10 py-4 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl active:scale-95 disabled:opacity-70 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-emerald-500/30' 
              : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-emerald-600/30'
          }`}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-center gap-3">
            {scheduleLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <svg 
                className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span>{scheduleLoading ? "Saving..." : "Update Schedule"}</span>
          </div>

          {/* Hover glow */}
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      </div>
      
      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        .custom-toggle.rs-toggle-checked .rs-toggle-presentation {
          background-color: #10b981 !important;
        }
        .rs-picker-subtle .rs-picker-toggle {
          background-color: transparent !important;
          border: none !important;
          color: inherit !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          padding: 8px 12px !important;
        }
        @media (min-width: 768px) {
          .rs-picker-subtle .rs-picker-toggle {
            font-size: 13px !important;
          }
        }
        .rs-picker-subtle .rs-picker-toggle:hover {
          background-color: transparent !important;
        }
        .rs-picker-menu {
          border-radius: 16px !important;
          overflow: hidden !important;
          border: 1px solid rgba(16, 185, 129, 0.1) !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
        }
        .rs-picker-select-menu-item {
          font-size: 13px !important;
          font-weight: 500 !important;
          padding: 8px 16px !important;
        }
        .rs-picker-select-menu-item-active {
          color: #10b981 !important;
          background-color: rgba(16, 185, 129, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
