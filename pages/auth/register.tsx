import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { hashPassword } from '../../src/utils/auth';
import { useAuth } from '../../src/context/AuthContext';

// Define mutation response and variables types
interface RegisterUserResponse {
  insert_Users: {
    returning: Array<{
      id: string;
      email: string;
      name: string;
      role: string;
    }>;
  };
}
interface RegisterUserVariables {
  email: string;
  name: string;
  password_hash: string;
  phone: string;
  role: string;
}

const REGISTER_MUTATION = gql`
  mutation RegisterNewUser($email: String!, $name: String!, $password_hash: String!, $phone: String!, $role: String = "customer") {
    insert_Users(objects: {
      email: $email,
      name: $name,
      password_hash: $password_hash,
      phone: $phone,
      role: $role,
      is_active: true
    }) {
      returning {
        id
        email
        name
        role
      }
    }
  }
`;

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Invalid phone number'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Use mutation with types and loading state
  const [registerUser, { loading: registerLoading }] = useMutation<RegisterUserResponse, RegisterUserVariables>(
    REGISTER_MUTATION,
    {
      onCompleted: (data) => console.log('Registration completed:', data),
      onError: (error) => {
        console.error('Registration error:', error);
        setError(error.message);
      },
    }
  );

  const onSubmit = async (formData: RegisterFormData) => {
    try {
      console.log('Submitting registration with data:', formData);

      // Hash the password
      const hashedPassword = await hashPassword(formData.password);

      const response = await registerUser({
        variables: {
          email: formData.email,
          name: formData.name,
          password_hash: hashedPassword,
          phone: formData.phone,
          role: 'customer',
        },
      });

      console.log('Registration response:', response);

      const newUser = response.data?.insert_Users.returning?.[0];
      if (newUser) {
        // Call the token generation API
        const tokenResponse = await fetch('/api/auth/generate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: newUser.id,
            role: newUser.role,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to generate token');
        }

        const { token } = await tokenResponse.json();

        // Store token and login user
        login(token);
        router.push('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
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
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
              />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                autoComplete="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Phone Number"
              />
              {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={registerLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 