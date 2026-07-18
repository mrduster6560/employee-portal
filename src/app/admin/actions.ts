'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('tasks').insert({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    assigned_to: formData.get('assigned_to') as string,
    assigned_by: user.id,
    priority: formData.get('priority') as string,
    due_date: (formData.get('due_date') as string) || null,
  })

  revalidatePath('/admin')
}
