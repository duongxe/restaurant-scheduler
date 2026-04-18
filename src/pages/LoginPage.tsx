import type { Employee } from "../types/schedule";
import { roleLabels } from "../utils/schedule";
import { Button } from "../components/Button";

interface LoginPageProps {
  employees: Employee[];
  onEmployeeChange: (employeeId: string) => void;
  onEmployeeLogin: () => void;
  onOwnerLogin: () => void;
  selectedEmployeeId: string;
}

export function LoginPage({
  employees,
  onEmployeeChange,
  onEmployeeLogin,
  onOwnerLogin,
  selectedEmployeeId,
}: LoginPageProps) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-center">
        <div className="mb-8">
          <p className="text-sm font-bold text-emerald-700">Sushi roster MVP</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950 sm:text-5xl">
            Sakura Sushi Roster
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Manual weekly scheduling, employee availability, and payroll-ready
            staff records for a small sushi restaurant.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-full flex-col">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Owner login</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Open the weekly roster board and assign staff manually.
                </p>
              </div>
              <Button className="mt-8 w-full" onClick={onOwnerLogin}>
                Enter as owner
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Employee login</h2>
            <p className="mt-2 text-sm text-slate-600">
              Choose a mock employee account and submit weekly availability.
            </p>

            <label className="mt-6 block text-sm font-semibold text-slate-700">
              Employee account
              <select
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                onChange={(event) => onEmployeeChange(event.target.value)}
                value={selectedEmployeeId}
              >
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {roleLabels[employee.role]}
                  </option>
                ))}
              </select>
            </label>

            <Button className="mt-4 w-full" onClick={onEmployeeLogin} variant="secondary">
              Enter as employee
            </Button>
          </section>
        </div>
      </div>
    </main>
  );
}
