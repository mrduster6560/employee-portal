import { createClient } from '@/lib/supabase/server'
import { createTask } from './actions'
import DeleteTaskButton from '@/components/DeleteTaskButton'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: employees } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'employee')
    .order('full_name')

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString()

  const { data: clockRecords } = await supabase
    .from('clock_records')
    .select('*')
    .gte('clock_in', sevenDaysAgoStr)

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')

  const { data: timeLogs } = await supabase
    .from('task_time_logs')
    .select('*')
    .gte('started_at', sevenDaysAgoStr)

  const stats = (employees ?? []).map((emp) => {
    const empClockRecords = (clockRecords ?? []).filter((c) => c.employee_id === emp.id)
    const empTasks = (tasks ?? []).filter((t) => t.assigned_to === emp.id)
    const empTimeLogs = (timeLogs ?? []).filter((l) => l.employee_id === emp.id)

    const totalSeconds = empClockRecords.reduce((sum, c) => {
      if (!c.clock_out) return sum
      const seconds = (new Date(c.clock_out).getTime() - new Date(c.clock_in).getTime()) / 1000
      return sum + seconds
    }, 0)

    const daysPresent = new Set(empClockRecords.map((c) => c.work_date)).size

    const completedTasks = empTasks.filter((t) => t.status === 'done').length
    const completionRate = empTasks.length > 0
      ? Math.round((completedTasks / empTasks.length) * 100)
      : 0

    const taskTimeTotals = new Map<string, number>()
    empTimeLogs.forEach((log) => {
      if (!log.duration_seconds) return
      taskTimeTotals.set(
        log.task_id,
        (taskTimeTotals.get(log.task_id) ?? 0) + log.duration_seconds
      )
    })

    return {
      employee: emp,
      hoursWorked: (totalSeconds / 3600).toFixed(1),
      daysPresent,
      completedTasks,
      completionRate,
      taskTimeTotals,
      empTasks,
      empClockRecords,
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">Admin dashboard</h1>

        {/* Create + assign task */}
        <div className="bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-lg shadow-sm p-5">
          <h2 className="text-sm font-medium text-gray-500 dark:text-neutral-400 mb-4">Assign a task</h2>
          <form action={createTask} className="grid grid-cols-2 gap-3">
            <input
              name="title"
              placeholder="Task title"
              required
              className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded px-3 py-2 text-sm col-span-2"
            />
            <textarea
              name="description"
              placeholder="Description"
              className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded px-3 py-2 text-sm col-span-2"
              rows={2}
            />
            <select name="assigned_to" required className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded px-3 py-2 text-sm">
              <option value="">Assign to...</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
            <select name="priority" defaultValue="medium" className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded px-3 py-2 text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              name="due_date"
              type="date"
              className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded px-3 py-2 text-sm"
            />
            <button className="bg-black dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm rounded px-4 py-2 hover:bg-gray-800 dark:hover:bg-white">
              Create task
            </button>
          </form>
        </div>

        {/* Productivity table */}
        <div className="bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-lg shadow-sm p-5 overflow-x-auto">
          <h2 className="text-sm font-medium text-gray-500 dark:text-neutral-400 mb-4">
            7-day productivity
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 dark:text-neutral-500 border-b border-gray-200 dark:border-neutral-800">
                <th className="pb-2 pr-4">Employee</th>
                <th className="pb-2 pr-4">Hours worked</th>
                <th className="pb-2 pr-4">Days present</th>
                <th className="pb-2 pr-4">Tasks done</th>
                <th className="pb-2 pr-4">Completion %</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.employee.id} className="border-b border-gray-100 dark:border-neutral-800 last:border-0 text-gray-900 dark:text-neutral-100">
                  <td className="py-2 pr-4 font-medium">{s.employee.full_name}</td>
                  <td className="py-2 pr-4">{s.hoursWorked}h</td>
                  <td className="py-2 pr-4">{s.daysPresent}</td>
                  <td className="py-2 pr-4">{s.completedTasks}</td>
                  <td className="py-2 pr-4">{s.completionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Clock in/out log */}
        <div className="bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-lg shadow-sm p-5">
          <h2 className="text-sm font-medium text-gray-500 dark:text-neutral-400 mb-4">Clock in / out log (last 7 days)</h2>
          <div className="space-y-4">
            {stats.map((s) => (
              <div key={s.employee.id}>
                <p className="text-sm font-medium mb-1 text-gray-900 dark:text-neutral-100">{s.employee.full_name}</p>
                <ul className="text-sm text-gray-500 dark:text-neutral-400 space-y-0.5">
                  {s.empClockRecords.map((c: any) => {
                    const inTime = new Date(c.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })
                    const outTime = c.clock_out
                      ? new Date(c.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })
                      : 'still clocked in'
                    return (
                      <li key={c.id} className="flex justify-between max-w-md">
                        <span>{c.work_date}</span>
                        <span>{inTime} → {outTime}</span>
                      </li>
                    )
                  })}
                  {s.empClockRecords.length === 0 && (
                    <li className="text-gray-300 dark:text-neutral-600">No clock records yet</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Per-task time totals with Delete Actions */}
        <div className="bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-lg shadow-sm p-5">
          <h2 className="text-sm font-medium text-gray-500 dark:text-neutral-400 mb-4">Time per task</h2>
          <div className="space-y-4">
            {stats.map((s) => (
              <div key={s.employee.id}>
                <p className="text-sm font-medium mb-1 text-gray-900 dark:text-neutral-100">{s.employee.full_name}</p>
                <ul className="text-sm text-gray-500 dark:text-neutral-400 space-y-0.5">
                  {s.empTasks.map((t: any) => {
                    const seconds = s.taskTimeTotals.get(t.id) ?? 0
                    const hours = (seconds / 3600).toFixed(1)
                    return (
                      <li key={t.id} className="flex justify-between max-w-md items-center py-1">
                        <span>{t.title}</span>
                        <div className="flex items-center gap-4">
                          <span>{hours}h</span>
                          <DeleteTaskButton taskId={t.id} />
                        </div>
                      </li>
                    )
                  })}
                  {s.empTasks.length === 0 && (
                    <li className="text-gray-300 dark:text-neutral-600">No tasks assigned</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}