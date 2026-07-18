import { createClient } from '@/lib/supabase/server'
import { createTask } from './actions'

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

  // Build per-employee productivity stats
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
    const onTimeDays = empClockRecords.filter((c) => c.is_on_time).length

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
      onTimeDays,
      completedTasks,
      completionRate,
      taskTimeTotals,
      empTasks,
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-xl font-semibold">Admin dashboard</h1>

        {/* Create + assign task */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-sm font-medium text-gray-500 mb-4">Assign a task</h2>
          <form action={createTask} className="grid grid-cols-2 gap-3">
            <input
              name="title"
              placeholder="Task title"
              required
              className="border rounded px-3 py-2 text-sm col-span-2"
            />
            <textarea
              name="description"
              placeholder="Description"
              className="border rounded px-3 py-2 text-sm col-span-2"
              rows={2}
            />
            <select name="assigned_to" required className="border rounded px-3 py-2 text-sm">
              <option value="">Assign to...</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
            <select name="priority" defaultValue="medium" className="border rounded px-3 py-2 text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              name="due_date"
              type="date"
              className="border rounded px-3 py-2 text-sm"
            />
            <button className="bg-black text-white text-sm rounded px-4 py-2 hover:bg-gray-800">
              Create task
            </button>
          </form>
        </div>

        {/* Productivity table */}
        <div className="bg-white rounded-lg shadow-sm p-5 overflow-x-auto">
          <h2 className="text-sm font-medium text-gray-500 mb-4">
            7-day productivity
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="pb-2 pr-4">Employee</th>
                <th className="pb-2 pr-4">Hours worked</th>
                <th className="pb-2 pr-4">Days present</th>
                <th className="pb-2 pr-4">On-time</th>
                <th className="pb-2 pr-4">Tasks done</th>
                <th className="pb-2 pr-4">Completion %</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.employee.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{s.employee.full_name}</td>
                  <td className="py-2 pr-4">{s.hoursWorked}h</td>
                  <td className="py-2 pr-4">{s.daysPresent}</td>
                  <td className="py-2 pr-4">{s.onTimeDays}</td>
                  <td className="py-2 pr-4">{s.completedTasks}</td>
                  <td className="py-2 pr-4">{s.completionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Per-task time totals */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-sm font-medium text-gray-500 mb-4">Time per task</h2>
          <div className="space-y-4">
            {stats.map((s) => (
              <div key={s.employee.id}>
                <p className="text-sm font-medium mb-1">{s.employee.full_name}</p>
                <ul className="text-sm text-gray-500 space-y-0.5">
                  {s.empTasks.map((t: any) => {
                    const seconds = s.taskTimeTotals.get(t.id) ?? 0
                    const hours = (seconds / 3600).toFixed(1)
                    return (
                      <li key={t.id} className="flex justify-between max-w-md">
                        <span>{t.title}</span>
                        <span>{hours}h</span>
                      </li>
                    )
                  })}
                  {s.empTasks.length === 0 && (
                    <li className="text-gray-300">No tasks assigned</li>
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
