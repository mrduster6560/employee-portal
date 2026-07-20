'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteTaskButton({ taskId }: { taskId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    setIsDeleting(true)
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    setIsDeleting(false)

    if (error) {
      alert('Failed to delete task: ' + error.message)
    } else {
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-xs bg-red-600 hover:bg-red-700 text-white font-medium px-2 py-1 rounded transition-colors disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}