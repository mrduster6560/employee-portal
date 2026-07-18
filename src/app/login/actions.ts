'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('SIGN IN ERROR:', JSON.stringify(error, null, 2))
    const message = error.message || error.name || 'Unknown sign in error'
    redirect(`/login?error=${encodeURIComponent(message)}`)
  }

  redirect('/')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  console.log('Attempting signup for:', email)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    console.error('SIGN UP ERROR:', JSON.stringify(error, null, 2))
    const message = error.message || error.name || 'Unknown sign up error'
    redirect(`/login?error=${encodeURIComponent(message)}`)
  }

  console.log('Signup result — user:', data.user?.id, 'session:', !!data.session)

  if (!data.session) {
    redirect(
      `/login?error=${encodeURIComponent('Account created but no session returned — check email confirmation setting')}`
    )
  }

  redirect('/')
}