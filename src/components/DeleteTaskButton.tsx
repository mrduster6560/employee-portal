'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task? Associated time logs will also be removed.')
    if (!confirmDelete) return

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      alert(`Error deleting task: ${error.message}`)
    } else {
      // Refreshes the current route to fetch the updated task list from the server
      router.refresh()
    }
  }

  return (
    
      Delete
    
  )
}