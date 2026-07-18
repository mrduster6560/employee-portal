'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function clockIn() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('clock_records').insert({
    employee_id: user.id,
    clock_in: new Date().toISOString(),
  })

  revalidatePath('/dashboard')
}

export async function clockOut(recordId: string) {
  const supabase = await createClient()

  await supabase
    .from('clock_records')
    .update({ clock_out: new Date().toISOString() })
    .eq('id', recordId)

  revalidatePath('/dashboard')
}

export async function startTaskTimer(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('task_time_logs').insert({
    task_id: taskId,
    employee_id: user.id,
    started_at: new Date().toISOString(),
  })

  await supabase.from('tasks').update({ status: 'in_progress' }).eq('id', taskId)

  revalidatePath('/dashboard')
}

export async function stopTaskTimer(logId: string) {
  const supabase = await createClient()

  await supabase
    .from('task_time_logs')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', logId)

  revalidatePath('/dashboard')
}

export async function markTaskDone(taskId: string) {
  const supabase = await createClient()

  await supabase
    .from('tasks')
    .update({ status: 'done', completed_at: new Date().toISOString() })
    .eq('id', taskId)

  revalidatePath('/dashboard')
}
