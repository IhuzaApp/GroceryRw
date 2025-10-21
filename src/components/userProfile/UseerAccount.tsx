import React, { useState, useEffect } from "react";
import { Button } from "rsuite";
import UserPaymentCards from "./UserPaymentCards";
import toast from "react-hot-toast";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export default function UserAccount() {
  const isMobile = useMediaQuery("(max-width: 768px)");
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

      // Get the full response for debugging
      const responseText = await response.text();

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

      // Get the full response for debugging
      const responseText = await response.text();

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
      {!isMobile && <UserPaymentCards />}

      <div className="block">
        <h3 className="mb-4 mt-3 text-lg font-bold text-inherit">
          Account Information
        </h3>
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
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                  Username
                </label>
                <input
                  className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-inherit shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none dark:border-gray-700 dark:placeholder:text-gray-500"
                  placeholder="Username"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  disabled={loading || saving}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                  Email
                </label>
                <input
                  className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-inherit shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none dark:border-gray-700 dark:placeholder:text-gray-500"
                  placeholder="Email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  disabled={true}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                  Phone
                </label>
                <input
                  className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-inherit shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none dark:border-gray-700 dark:placeholder:text-gray-500"
                  placeholder="Phone"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                  disabled={loading || saving}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                  Gender
                </label>
                <select
                  className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-inherit shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none dark:border-gray-700 dark:placeholder:text-gray-500"
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

            <Button
              appearance="primary"
              type="submit"
              className="mt-4 !bg-green-500 text-white hover:!bg-green-600"
              disabled={loading || saving}
            >
              {saving ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        )}

        <h3 className="mb-4 mt-8 text-lg font-bold text-inherit">
          Change Password
        </h3>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
            <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-inherit shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none dark:border-gray-700 dark:placeholder:text-gray-500"
                  type="password"
                  placeholder="Current Password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={loading || saving}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                  New Password
                </label>
                <input
                  className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-inherit shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none dark:border-gray-700 dark:placeholder:text-gray-500"
                  type="password"
                  placeholder="New Password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  disabled={loading || saving}
                />
              </div>
            </div>

            <Button
              appearance="primary"
              type="submit"
              className="mt-4 !bg-green-500 text-white hover:!bg-green-600"
              disabled={loading || saving}
            >
              {saving ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
