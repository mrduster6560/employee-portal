'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn, signUp } from './actions'

function LoginForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-lg shadow p-8 border border-transparent dark:border-neutral-800">
        <h1 className="text-2xl font-semibold mb-1 text-center text-gray-900 dark:text-neutral-100">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 text-center mb-6">
          Employee Productivity Portal
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded p-2">
            {error}
          </div>
        )}

        <form action={mode === 'signin' ? signIn : signUp} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-neutral-300">Full name</label>
              <input
                name="fullName"
                type="text"
                required
                className="w-full border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded px-3 py-2 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-neutral-300">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-neutral-300">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black dark:bg-neutral-100 text-white dark:text-neutral-900 rounded py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-white"
          >
            {mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full text-center text-sm text-gray-500 dark:text-neutral-400 mt-4 hover:underline"
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}