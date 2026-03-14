import { MapPin, Globe, Clock, Layout } from "lucide-react";
import { Autocomplete } from "@react-google-maps/api";

interface Step4LocationProps {
  formData: any;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onOperatingHoursChange: (day: string, value: string) => void;
  isLoaded: boolean;
  autocompleteRef: React.MutableRefObject<google.maps.places.Autocomplete | null>;
  onPlaceChanged: () => void;
}

export default function Step4Location({
  formData,
  onChange,
  onOperatingHoursChange,
  isLoaded,
  autocompleteRef,
  onPlaceChanged,
}: Step4LocationProps) {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <div className="space-y-10 duration-500 animate-in fade-in slide-in-from-right-4">
      <div>
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Physical Location</h2>
        <p className="mt-2 text-gray-500">
          Tell us where your business is situated and its working hours.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">
            Physical Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            {isLoaded ? (
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  required
                  name="address"
                  value={formData.address}
                  onChange={onChange}
                  className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
                  placeholder="Start typing your address..."
                />
              </Autocomplete>
            ) : (
              <input
                required
                name="address"
                value={formData.address}
                onChange={onChange}
                className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
                placeholder="Enter physical address"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Latitude</label>
            <input
              required
              readOnly
              name="lat"
              value={formData.lat}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-100 px-4 text-gray-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Longitude</label>
            <input
              required
              readOnly
              name="long"
              value={formData.long}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-100 px-4 text-gray-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
            <Clock className="h-4 w-4" />
            Operating Hours
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {days.map((day) => {
              const currentValue = formData.operating_hours[day];
              const isClosed = currentValue === "Closed";
              const [startTime, endTime] = !isClosed
                ? currentValue.split(" - ")
                : ["08:00", "20:00"];

              return (
                <div
                  key={day}
                  className={`rounded-2xl border-2 p-5 space-y-4 transition-all duration-300 ${isClosed
                    ? "border-gray-100 bg-gray-50/50 opacity-80"
                    : "border-gray-100 bg-white shadow-sm hover:border-[#022C22]/20 shadow-gray-200/50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-extrabold capitalize ${isClosed ? "text-gray-400" : "text-[#1A1A1A]"}`}>
                      {day}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOperatingHoursChange(day, isClosed ? "08:00 - 20:00" : "Closed")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${isClosed
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}
                    >
                      {isClosed ? "Closed" : "Open"}
                    </button>
                  </div>

                  {!isClosed ? (
                    <div className="space-y-4 pt-4 border-t border-gray-50">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Opening Time</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => onOperatingHoursChange(day, `${e.target.value} - ${endTime}`)}
                          className="h-12 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 text-sm font-bold text-[#1A1A1A] outline-none focus:border-[#022C22] focus:bg-white transition-all"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-[1px] flex-1 bg-gray-100" />
                        <span className="text-[10px] font-bold text-gray-300 uppercase">to</span>
                        <div className="h-[1px] flex-1 bg-gray-100" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Closing Time</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => onOperatingHoursChange(day, `${startTime} - ${e.target.value}`)}
                          className="h-12 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 text-sm font-bold text-[#1A1A1A] outline-none focus:border-[#022C22] focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-[160px] flex flex-col items-center justify-center rounded-xl bg-gray-100/50 border-2 border-dashed border-gray-200/50">
                      <Clock className="h-6 w-6 text-gray-300 mb-2" />
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Day Off</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">
            Business Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            className="min-h-[120px] w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
            placeholder="Tell us a bit about your business..."
          />
        </div>
      </div>
    </div>
  );
}
