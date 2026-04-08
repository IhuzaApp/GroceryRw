import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

// ─── DiceBear Avatar Definitions ───────────────────────────────────────────

type AvatarCategory = "superheroes" | "animals" | "cartoons" | "chefs";

interface AvatarOption {
  id: string;
  url: string;
  label: string;
}

/** Build a DiceBear SVG URL */
const dicebear = (style: string, seed: string, extra = "") =>
  `https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(seed)}${extra}`;

const CATEGORIES: {
  key: AvatarCategory;
  label: string;
  emoji: string;
  gradient: string;
  avatars: AvatarOption[];
}[] = [
  {
    key: "superheroes",
    label: "Superheroes",
    emoji: "🦸",
    gradient: "from-violet-500 to-indigo-600",
    avatars: [
      { id: "sh1", url: dicebear("avataaars", "Thor"), label: "Thor" },
      { id: "sh2", url: dicebear("avataaars", "IronMan"), label: "Iron Man" },
      { id: "sh3", url: dicebear("avataaars", "Batman"), label: "Batman" },
      { id: "sh4", url: dicebear("avataaars", "Spiderman"), label: "Spider-Man" },
      { id: "sh5", url: dicebear("avataaars", "WonderWoman"), label: "Wonder Woman" },
      { id: "sh6", url: dicebear("avataaars", "CaptainAmerica"), label: "Captain America" },
      { id: "sh7", url: dicebear("avataaars", "BlackPanther"), label: "Black Panther" },
      { id: "sh8", url: dicebear("avataaars", "Superman"), label: "Superman" },
      { id: "sh9", url: dicebear("avataaars", "Flash"), label: "Flash" },
      { id: "sh10", url: dicebear("avataaars", "Hulk"), label: "Hulk" },
      { id: "sh11", url: dicebear("avataaars", "AquaMan"), label: "Aqua Man" },
      { id: "sh12", url: dicebear("avataaars", "DrStrange"), label: "Dr. Strange" },
    ],
  },
  {
    key: "animals",
    label: "Animals",
    emoji: "🐾",
    gradient: "from-emerald-500 to-teal-600",
    avatars: [
      { id: "an1", url: dicebear("adventurer", "Lion"), label: "Lion" },
      { id: "an2", url: dicebear("adventurer", "Panda"), label: "Panda" },
      { id: "an3", url: dicebear("adventurer", "Fox"), label: "Fox" },
      { id: "an4", url: dicebear("adventurer", "Wolf"), label: "Wolf" },
      { id: "an5", url: dicebear("adventurer", "Bear"), label: "Bear" },
      { id: "an6", url: dicebear("adventurer", "Tiger"), label: "Tiger" },
      { id: "an7", url: dicebear("adventurer", "Rabbit"), label: "Rabbit" },
      { id: "an8", url: dicebear("adventurer", "Cat"), label: "Cat" },
      { id: "an9", url: dicebear("adventurer", "Dog"), label: "Dog" },
      { id: "an10", url: dicebear("adventurer", "Elephant"), label: "Elephant" },
      { id: "an11", url: dicebear("adventurer", "Penguin"), label: "Penguin" },
      { id: "an12", url: dicebear("adventurer", "Koala"), label: "Koala" },
    ],
  },
  {
    key: "cartoons",
    label: "Cartoons",
    emoji: "🎨",
    gradient: "from-pink-500 to-rose-600",
    avatars: [
      { id: "ct1", url: dicebear("lorelei", "Sunny"), label: "Sunny" },
      { id: "ct2", url: dicebear("lorelei", "Buddy"), label: "Buddy" },
      { id: "ct3", url: dicebear("lorelei", "Zippy"), label: "Zippy" },
      { id: "ct4", url: dicebear("lorelei", "Doodle"), label: "Doodle" },
      { id: "ct5", url: dicebear("micah", "Pixel"), label: "Pixel" },
      { id: "ct6", url: dicebear("micah", "Spark"), label: "Spark" },
      { id: "ct7", url: dicebear("micah", "Nova"), label: "Nova" },
      { id: "ct8", url: dicebear("micah", "Blaze"), label: "Blaze" },
      { id: "ct9", url: dicebear("fun-emoji", "Cheerful"), label: "Cheerful" },
      { id: "ct10", url: dicebear("fun-emoji", "Jolly"), label: "Jolly" },
      { id: "ct11", url: dicebear("fun-emoji", "Giddy"), label: "Giddy" },
      { id: "ct12", url: dicebear("fun-emoji", "Peppy"), label: "Peppy" },
    ],
  },
  {
    key: "chefs",
    label: "Chefs",
    emoji: "👨‍🍳",
    gradient: "from-orange-500 to-amber-500",
    avatars: [
      { id: "ch1", url: dicebear("notionists", "GordonRamsay"), label: "Gordon" },
      { id: "ch2", url: dicebear("notionists", "JamieOliver"), label: "Jamie" },
      { id: "ch3", url: dicebear("notionists", "MasterChef"), label: "MasterChef" },
      { id: "ch4", url: dicebear("notionists", "SousChef"), label: "Sous Chef" },
      { id: "ch5", url: dicebear("notionists", "PastryChef"), label: "Pastry Chef" },
      { id: "ch6", url: dicebear("notionists", "GrillMaster"), label: "Grill Master" },
      { id: "ch7", url: dicebear("personas", "ChefBob"), label: "Chef Bob" },
      { id: "ch8", url: dicebear("personas", "ChefMaria"), label: "Chef Maria" },
      { id: "ch9", url: dicebear("personas", "BakeryKing"), label: "Bakery King" },
      { id: "ch10", url: dicebear("personas", "SushiSensei"), label: "Sushi Sensei" },
      { id: "ch11", url: dicebear("personas", "SpiceGuru"), label: "Spice Guru" },
      { id: "ch12", url: dicebear("personas", "CafeBoss"), label: "Cafe Boss" },
    ],
  },
];

// ─── Props ──────────────────────────────────────────────────────────────────

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onAvatarSaved: (newUrl: string) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatar,
  onAvatarSaved,
}: AvatarPickerModalProps) {
  const [activeCategory, setActiveCategory] =
    useState<AvatarCategory>("superheroes");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const currentCat = CATEGORIES.find((c) => c.key === activeCategory)!;

  const handleSave = async () => {
    if (!selectedUrl) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/update-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: selectedUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save avatar");
      }

      onAvatarSaved(selectedUrl);
      toast.success("Avatar updated! 🎉");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Could not save avatar");
    } finally {
      setSaving(false);
    }
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set(Array.from(prev).concat(id)));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-gray-900 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
        style={{ maxHeight: "90dvh" }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="relative px-6 pb-4 pt-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Choose Your Avatar
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Pick a character that represents you
          </p>
        </div>

        {/* Preview strip */}
        <div className="flex items-center gap-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-3 dark:border-gray-800 dark:from-gray-800/50 dark:to-gray-900">
          {/* Current */}
          <div className="flex flex-col items-center gap-1">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-gray-200 bg-white shadow dark:border-gray-700">
              <img
                src={currentAvatar || "/images/userProfile.png"}
                alt="Current"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-[10px] text-gray-400">Current</span>
          </div>

          <svg className="h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          {/* Selected */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`h-14 w-14 overflow-hidden rounded-full border-3 shadow-lg transition-all ${
                selectedUrl
                  ? "border-green-400 ring-2 ring-green-300 ring-offset-1"
                  : "border-dashed border-gray-300 dark:border-gray-600"
              }`}
            >
              {selectedUrl ? (
                <img
                  src={selectedUrl}
                  alt="Selected"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <span className="text-xl">?</span>
                </div>
              )}
            </div>
            <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
              {selectedUrl ? "Preview" : "Select one"}
            </span>
          </div>

          {selectedUrl && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Save
                </>
              )}
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="scrollbar-hide flex gap-2 overflow-x-auto border-b border-gray-100 px-4 pb-2 pt-3 dark:border-gray-800">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                activeCategory === cat.key
                  ? `bg-gradient-to-r ${cat.gradient} text-white shadow-md`
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Avatar Grid */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: "340px" }}>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {currentCat.avatars.map((avatar) => {
              const isSelected = selectedUrl === avatar.url;
              const hasError = imageErrors.has(avatar.id);

              return (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedUrl(avatar.url)}
                  className={`group flex flex-col items-center gap-1.5 rounded-2xl p-2 transition-all duration-200 ${
                    isSelected
                      ? `bg-gradient-to-br ${currentCat.gradient} shadow-lg ring-2 ring-white/50`
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <div
                    className={`relative h-12 w-12 overflow-hidden rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-white shadow-xl"
                        : "border-gray-200 group-hover:border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    {hasError ? (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-lg dark:bg-gray-800">
                        {currentCat.emoji}
                      </div>
                    ) : (
                      <img
                        src={avatar.url}
                        alt={avatar.label}
                        className="h-full w-full object-cover"
                        onError={() => handleImageError(avatar.id)}
                        loading="lazy"
                      />
                    )}

                    {/* Checkmark overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <svg className="h-5 w-5 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <span
                    className={`max-w-full truncate text-[10px] font-medium leading-tight ${
                      isSelected ? "text-white" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {avatar.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-3 dark:border-gray-800">
          <p className="text-center text-xs text-gray-400 dark:text-gray-600">
            Avatars powered by{" "}
            <span className="font-medium text-gray-500 dark:text-gray-500">
              DiceBear
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
