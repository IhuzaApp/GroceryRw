import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { Toggle, SelectPicker, Button, Message, Loader } from "rsuite";
import { logger } from "../../../utils/logger";

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface Session {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string | null;
    image: string | null;
  };
  expires: string;
}

interface WorkScheduleTabProps {
  initialSession: Session;
}

export default function WorkScheduleTab({ initialSession }: WorkScheduleTabProps) {
  const { theme } = useTheme();
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(true);
  const [hasSchedule, setHasSchedule] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);
  // Use a ref to prevent multiple simultaneous loads
  const isLoading = useRef(false);

  // Days of the week
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Time slots
  const generateTimeSlots = useCallback(() => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}` : `${i}`;
      slots.push({ label: `${hour}:00`, value: `${hour}:00:00` });
      slots.push({ label: `${hour}:30`, value: `${hour}:30:00` });
    }
    return slots;
  }, []);

  const timeSlots = generateTimeSlots();

  // Format time for display
  const formatTimeForDisplay = useCallback((time: string | undefined): string => {
    if (!time) return "09:00:00";
    if (time.split(":").length === 3) return time;
    if (time.split(":").length === 2) return `${time}:00`;
    return "09:00:00";
  }, []);

  // Load schedule
  const loadSchedule = useCallback(async () => {
    if (!initialSession?.user?.id) {
      logger.error("No user ID found in session", "WorkScheduleTab");
      setLoadError("Session error. Please try refreshing the page.");
      setScheduleLoading(false);
      return;
    }

    if (isLoading.current) {
      logger.info("Schedule load in progress", "WorkScheduleTab");
      return;
    }

    try {
      isLoading.current = true;
      setScheduleLoading(true);
      setLoadError(null);

      const response = await fetch("/api/shopper/schedule", {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      logger.info("Schedule data received", "WorkScheduleTab", {
        hasSchedule: data.hasSchedule,
        scheduleCount: data.schedule?.length ?? 0
      });
      
      if (!isMounted.current) return;

      // Initialize with default values for all days
      const daysMap = new Map();
      days.forEach((day) => {
        daysMap.set(day, {
          day,
          startTime: "09:00:00",
          endTime: "17:00:00",
          available: day !== "Sunday",
        });
      });

      if (data.schedule && Array.isArray(data.schedule) && data.schedule.length > 0) {
        // Update with actual data from server
        data.schedule.forEach((slot: {
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
        }) => {
          const day = days[slot.day_of_week - 1];
          if (day) {
            daysMap.set(day, {
              day,
              startTime: slot.start_time,
              endTime: slot.end_time,
              available: slot.is_available,
            });
          }
        });
      }

      const fullSchedule = Array.from(daysMap.values());
      logger.info("Schedule processed", "WorkScheduleTab", {
        scheduleSize: fullSchedule.length,
        firstDay: fullSchedule[0]?.day
      });
      
      setSchedule(fullSchedule);
      setHasSchedule(data.hasSchedule ?? data.schedule?.length > 0 ?? false);
      setScheduleLoading(false);

    } catch (err) {
      if (!isMounted.current) return;
      
      logger.error(
        "Schedule fetch error",
        "WorkScheduleTab",
        err instanceof Error ? err.message : "Unknown error"
      );
      setLoadError("Failed to load schedule. Please try again.");
      
      // Set default schedule on error
      const defaultSchedule = days.map((day) => ({
        day,
        startTime: "09:00:00",
        endTime: "17:00:00",
        available: day !== "Sunday",
      }));
      setSchedule(defaultSchedule);
      setHasSchedule(false);
      setScheduleLoading(false);
    } finally {
      isLoading.current = false;
    }
  }, [days, initialSession?.user?.id]);

  // Initial load
  useEffect(() => {
    loadSchedule();
    return () => {
      isMounted.current = false;
    };
  }, [loadSchedule]);

  // Handle availability toggle
  const handleAvailabilityToggle = useCallback((day: string, available: boolean) => {
    setSchedule((prev) =>
      prev.map((slot) => (slot.day === day ? { ...slot, available } : slot))
    );
  }, []);

  // Handle time change
  const handleTimeChange = useCallback((
    day: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((slot) =>
        slot.day === day ? { ...slot, [field]: value } : slot
      )
    );
  }, []);

  // Save schedule updates
  const saveScheduleUpdates = useCallback(async () => {
    if (!initialSession?.user?.id) {
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
      logger.info("Schedule saved", "WorkScheduleTab", {
        success: result.success,
        affectedRows: result.affected_rows
      });

      setSaveMessage({
        type: "success",
        text: "Schedule updated successfully!",
      });
      setHasSchedule(true);
      
      // Update local state directly
      setSchedule(prev => 
        prev.map((slot, index) => ({
          ...slot,
          startTime: formattedSchedule[index].start_time,
          endTime: formattedSchedule[index].end_time,
          available: formattedSchedule[index].is_available,
        }))
      );
    } catch (err) {
      logger.error(
        "Schedule save error",
        "WorkScheduleTab",
        err instanceof Error ? err.message : "Unknown error"
      );
      setSaveMessage({
        type: "error",
        text: "Failed to update schedule. Please try again.",
      });
    }
  }, [initialSession?.user?.id, schedule]);

  // Clear save message after 5 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setSaveMessage(null);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  if (loadError) {
    return (
      <div className="p-4">
        <Message type="error" className="mb-4">
          {loadError}
        </Message>
        <Button appearance="primary" onClick={() => loadSchedule()}>
          Retry Loading
        </Button>
      </div>
    );
  }

  if (scheduleLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="md" content="Loading schedule..." />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3
        className={`mb-4 text-lg font-semibold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        Work Schedule
      </h3>
      <p className={`mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
        Set your availability for each day of the week. Toggle availability and select your preferred working hours.
      </p>

      {saveMessage && (
        <Message
          type={saveMessage.type}
          className="mb-4"
          closable
          onClose={() => setSaveMessage(null)}
        >
          {saveMessage.text}
        </Message>
      )}

      <div className="space-y-4">
        {schedule.map((slot) => (
          <div
            key={slot.day}
            className={`flex flex-col space-y-2 rounded-lg border p-4 ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`font-medium ${
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
                unCheckedChildren="Unavailable"
              />
            </div>

            {slot.available && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Start:
                  </span>
                  <SelectPicker
                    data={timeSlots}
                    value={slot.startTime}
                    onChange={(value) =>
                      handleTimeChange(slot.day, "startTime", value || "09:00:00")
                    }
                    cleanable={false}
                    searchable={false}
                    className="w-32"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    End:
                  </span>
                  <SelectPicker
                    data={timeSlots}
                    value={slot.endTime}
                    onChange={(value) =>
                      handleTimeChange(slot.day, "endTime", value || "17:00:00")
                    }
                    cleanable={false}
                    searchable={false}
                    className="w-32"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          appearance="primary"
          onClick={saveScheduleUpdates}
          loading={scheduleLoading}
        >
          Save Schedule
        </Button>
      </div>
    </div>
  );
} 