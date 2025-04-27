import { useState } from 'react';
import { useRouter } from 'next/router';
import { gql } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { comparePasswords } from '../../src/utils/auth';
import { useAuth } from '../../src/context/AuthContext';
import { client } from '../../lib/apollo-client';

// Define the User type
interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  phone: string;
  profile_picture: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Define the query response and variables types
interface LoginQueryResponse {
  Users: User[];
}
interface LoginQueryVariables {
  email: string;
}

const LOGIN_QUERY = gql`
  query getUserWhereEmail($email: String!) {
    Users(where: {email: {_eq: $email}}) {
      created_at
      email
      id
      is_active
      name
      password_hash
      phone
      profile_picture
      role
      updated_at
    }
  }
`;

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (formData: LoginFormData) => {
    setError(null);
    setLoadingLogin(true);
    try {
      console.log('Submitting login with data:', formData);

      // Fetch user by email
      const result = await client.query<LoginQueryResponse, LoginQueryVariables>({
        query: LOGIN_QUERY,
        variables: { email: formData.email },
        fetchPolicy: 'network-only',
      });
      const user = result.data.Users[0];
      if (!user) throw new Error('Invalid email or password');

      console.log('Found user:', JSON.stringify(user, null, 2));
      console.log('Stored password hash:', user.password_hash);
      console.log('Input password:', formData.password);

      const isPasswordValid = await comparePasswords(formData.password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const tokenResponse = await fetch('/api/auth/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          role: user.role,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to generate token');
      }

      const { token } = await tokenResponse.json();
      login(token);

      const redirectPath = (router.query.redirect as string) || '/';
      router.push(redirectPath);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loadingLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingLogin ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 