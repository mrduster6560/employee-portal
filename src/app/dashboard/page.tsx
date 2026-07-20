import { createClient } from '@/lib/supabase/server'
import { clockIn, clockOut, startTaskTimer, stopTaskTimer, markTaskDone } from './actions'

const priorityColor: Record<string, string> = {
  low: 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300',
  medium: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  high: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: openClockRecord } = await supabase
    .from('clock_records')
    .select('*')
    .eq('employee_id', user.id)
    .is('clock_out', null)
    .gte('clock_in', todayStart.toISOString())
    .order('clock_in', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', user.id)
    .order('due_date', { ascending: true })

  const { data: runningLogs } = await supabase
    .from('task_time_logs')
    .select('*')
    .eq('employee_id', user.id)
    .is('ended_at', null)

  const runningLogByTask = new Map(
    (runningLogs ?? []).map((log) => [log.task_id, log])
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">Hi, {profile?.full_name}</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400">Employee dashboard</p>
          </div>

          {openClockRecord ? (
            <form action={clockOut.bind(null, openClockRecord.id)}>
              <button className="bg-red-600 text-white text-sm px-4 py-2 rounded hover:bg-red-700">
                Clock out
              </button>
            </form>
          ) : (
            <form action={clockIn}>
              <button className="bg-green-600 text-white text-sm px-4 py-2 rounded hover:bg-green-700">
                Clock in
              </button>
            </form>
          )}
        </div>

        <h2 className="text-sm font-medium text-gray-500 dark:text-neutral-400 mb-3">Your tasks</h2>
        <div className="space-y-3">
          {tasks?.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-neutral-500">No tasks assigned yet.</p>
          )}

          {tasks?.map((task) => {
            const runningLog = runningLogByTask.get(task.id)

            return (
              <div key={task.id} className="bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-neutral-100">{task.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${priorityColor[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-neutral-400 mb-1">{task.description}</p>
                    )}
                    {task.due_date && (
                      <p className="text-xs text-gray-400 dark:text-neutral-500">Due {task.due_date}</p>
                    )}
                  </div>
                  <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-neutral-500">
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                {task.status !== 'done' && (
                  <div className="flex items-center gap-2 mt-3">
                    {runningLog ? (
                      <form action={stopTaskTimer.bind(null, runningLog.id)}>
                        <button className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded hover:bg-amber-600">
                          Stop timer
                        </button>
                      </form>
                    ) : (
                      <form action={startTaskTimer.bind(null, task.id)}>
                        <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                          Start timer
                        </button>
                      </form>
                    )}

                    <form action={markTaskDone.bind(null, task.id)}>
                      <button className="text-xs bg-gray-800 dark:bg-neutral-700 text-white px-3 py-1.5 rounded hover:bg-gray-900 dark:hover:bg-neutral-600">
                        Mark done
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}