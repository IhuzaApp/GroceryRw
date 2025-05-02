import Link from "next/link";
import React, { useState } from "react";
import { Input, InputGroup, Checkbox, Button } from "rsuite";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function UserRegistration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");
  const router = useRouter();
  const { redirect } = router.query as { redirect?: string };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, gender }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      toast.success("Account created successfully");
      if (redirect) {
        router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      } else {
        router.push("/auth/login");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  return (
    <form onSubmit={handleRegister}>
      <div className="mb-4">
        <label htmlFor="name" className="mb-2 block text-gray-700">
          Full Name
        </label>
        <Input
          id="name"
          placeholder="Enter your full name"
          value={name}
          onChange={(value) => setName(value as string)}
          className="w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="mb-2 block text-gray-700">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(value) => setEmail(value as string)}
          className="w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="mb-2 block text-gray-700">
          Password
        </label>
        <InputGroup inside>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(value) => setPassword(value as string)}
            className="w-full"
            required
          />
          <InputGroup.Button
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-500"
          >
            {showPassword ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </InputGroup.Button>
        </InputGroup>
        <p className="mt-1 text-xs text-gray-500">
          Password must be at least 8 characters long with a number and a
          special character
        </p>
      </div>
      <div className="mb-6">
        <label htmlFor="confirmPassword" className="mb-2 block text-gray-700">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(value) => setConfirmPassword(value as string)}
          className="w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="phone" className="mb-2 block text-gray-700">
          Phone Number
        </label>
        <Input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(value) => setPhone(value as string)}
          className="w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="gender" className="mb-2 block text-gray-700">
          Gender
        </label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="mb-6">
        <Checkbox
          checked={agreeTerms}
          onChange={(_, checked) => setAgreeTerms(checked)}
          className="text-sm text-gray-600"
        >
          I agree to the{" "}
          <Link href="/terms" className="text-green-600 hover:text-green-800">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-green-600 hover:text-green-800">
            Privacy Policy
          </Link>
        </Checkbox>
      </div>
      <Button
        appearance="primary"
        type="submit"
        className="mb-4 w-full rounded-md bg-green-500 py-3 text-white hover:bg-green-600"
        disabled={!agreeTerms}
      >
        Create Account
      </Button>
      <Button
        appearance="default"
        className="flex w-full items-center justify-center gap-2 rounded-md border py-3"
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign up with Google
      </Button>
    </form>
  );
}
