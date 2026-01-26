import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../hooks/useAuth";
import { Toggle, SelectPicker, Button, Message, Loader } from "rsuite";

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
    return (
      <div className="flex h-48 items-center justify-center sm:h-64">
        <Loader size="md" content="Loading schedule..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h3
        className={`mb-2 text-xl font-bold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        Work Schedule
      </h3>
      <p
        className={`mb-8 text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Set your availability for each day of the week. Toggle availability and
        select your preferred working hours.
      </p>

      {saveMessage && (
        <Message
          type={saveMessage.type}
          className="mb-6 text-sm sm:text-base"
          closable
          onClose={() => setSaveMessage(null)}
        >
          {saveMessage.text}
        </Message>
      )}

      <div className="space-y-4">
        {schedule.map((slot, index) => (
          <div
            key={slot.day}
            className={`flex flex-col space-y-4 pb-6 ${
              index < schedule.length - 1
                ? `border-b ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-base font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {slot.day}
              </span>
              <Toggle
                checked={slot.available}
                onChange={(checked) =>
                  handleAvailabilityToggle(slot.day, checked)
                }
                size="md"
                checkedChildren="Available"
                unCheckedChildren="Off"
                className="min-w-[100px]"
              />
            </div>

            {slot.available && (
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <span
                    className={`whitespace-nowrap text-sm font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Start:
                  </span>
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
                    className="w-full sm:w-36"
                    menuStyle={{ zIndex: 1060 }}
                  />
                </div>
                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <span
                    className={`whitespace-nowrap text-sm font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    End:
                  </span>
                  <SelectPicker
                    data={timeSlots}
                    value={formatTimeForDisplay(slot.endTime)}
                    onChange={(value) =>
                      handleTimeChange(slot.day, "endTime", value || "17:00:00")
                    }
                    cleanable={false}
                    searchable={false}
                    className="w-full sm:w-36"
                    menuStyle={{ zIndex: 1060 }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          appearance="primary"
          onClick={saveScheduleUpdates}
          loading={scheduleLoading}
          className="px-6 py-2 font-medium"
        >
          Save Schedule
        </Button>
      </div>
    </div>
  );
}
