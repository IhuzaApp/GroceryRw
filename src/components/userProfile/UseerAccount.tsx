import React, { useState, useEffect } from "react";
import { Button } from "rsuite";
import UserPaymentCards from "./UserPaymentCards";
import toast from "react-hot-toast";

export default function UserAccount() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            gender: data.user.gender || "",
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load user data:", err);
        toast.error("Failed to load user profile");
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log("Updating profile with data:", user);

      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          gender: user.gender,
        }),
      });

      // Log the full response for debugging
      const responseText = await response.text();
      console.log(`Response status: ${response.status}`, responseText);

      let data;
      try {
        // Try to parse as JSON
        data = JSON.parse(responseText);
      } catch (err) {
        console.error("Failed to parse response as JSON:", err);
        // If not JSON, use the text as error message
        toast.error(
          "Server error: " + (responseText.substring(0, 100) || "Unknown error")
        );
        return;
      }

      if (response.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log("Updating password...");

      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      // Log the full response for debugging
      const responseText = await response.text();
      console.log(
        `Password change response status: ${response.status}`,
        responseText
      );

      let data;
      try {
        // Try to parse as JSON
        data = JSON.parse(responseText);
      } catch (err) {
        console.error("Failed to parse password response as JSON:", err);
        // If not JSON, use the text as error message
        toast.error(
          "Server error: " + (responseText.substring(0, 100) || "Unknown error")
        );
        return;
      }

      if (response.ok) {
        toast.success("Password updated successfully");
        setPasswords({ currentPassword: "", newPassword: "" });
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An error occurred while updating your password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <UserPaymentCards />

      <div className="hidden sm:block">
        <h3 className="mb-4 mt-3 text-lg font-bold">Account Information</h3>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
            <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
            <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
            <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Username
                </label>
                <input
                  className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
                  placeholder="Username"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  disabled={loading || saving}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Email Address
                </label>
                <input
                  className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
                  placeholder="Email Address"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  disabled={true} // Email cannot be changed
                  title="Email address cannot be changed"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Phone Number
                </label>
                <input
                  className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
                  placeholder="Phone Number"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                  disabled={loading || saving}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Gender
                </label>
                <select
                  className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
                  name="gender"
                  value={user.gender}
                  onChange={handleChange}
                  disabled={loading || saving}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="rounded border bg-green-700 px-3 py-2 text-sm text-white hover:bg-green-600 disabled:bg-gray-400"
                disabled={saving || loading}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      <h3 className="mb-4 mt-6 text-lg font-bold">Password</h3>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
          <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
        </div>
      ) : (
        <form onSubmit={handlePasswordSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Current Password
              </label>
              <input
                className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
                type="password"
                placeholder="Current Password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                disabled={loading || saving}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                New Password
              </label>
              <input
                className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
                type="password"
                placeholder="New Password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                disabled={loading || saving}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded border bg-green-700 px-3 py-2 text-sm text-white hover:bg-green-600 disabled:bg-gray-400"
              disabled={
                saving ||
                loading ||
                !passwords.currentPassword ||
                !passwords.newPassword
              }
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
