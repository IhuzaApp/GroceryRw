import { MapPin, Globe, Clock, Layout } from "lucide-react";
import { Autocomplete } from "@react-google-maps/api";

interface Step4LocationProps {
  formData: any;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  isLoaded: boolean;
  autocompleteRef: React.MutableRefObject<google.maps.places.Autocomplete | null>;
  onPlaceChanged: () => void;
}

export default function Step4Location({
  formData,
  onChange,
  isLoaded,
  autocompleteRef,
  onPlaceChanged,
}: Step4LocationProps) {
  return (
    <div className="space-y-10 duration-500 animate-in fade-in slide-in-from-right-4">
      <div>
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Physical Location</h2>
        <p className="mt-2 text-gray-500">
          Tell us where your business is situated.
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
