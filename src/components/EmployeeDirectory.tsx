import { useState } from "react";
import type {
  Availability,
  Employee,
  PayLevel,
  PayLevelRates,
  Role,
} from "../types/schedule";
import { DAYS, ROLES } from "../types/schedule";
import { Button } from "./Button";
import { cn } from "../utils/classNames";
import {
  availabilityLabels,
  formatMoney,
  getEmployeeAvailability,
  roleLabels,
  roleStyles,
  summarizeAvailability,
} from "../utils/schedule";

interface EmployeeDirectoryProps {
  availabilities: Availability[];
  employees: Employee[];
  onAddEmployee: (name: string, roles: Role[], level: PayLevel, password: string) => Promise<void>;
  onDeleteEmployee: (employeeId: string) => Promise<void>;
  onEditEmployee: (
    employeeId: string,
    updates: { name: string; roles: Role[]; level: PayLevel; password?: string },
  ) => Promise<void>;
  onUpdateEmployeeLevel: (employeeId: string, level: PayLevel) => void;
  onUpdatePayLevelRate: (level: PayLevel, hourlyRate: number) => void;
  payLevelRates: PayLevelRates;
  weekStart: string;
}

const payLevels: PayLevel[] = [0, 1, 2, 3, 4];

export function EmployeeDirectory({
  availabilities,
  employees,
  onAddEmployee,
  onDeleteEmployee,
  onEditEmployee,
  onUpdateEmployeeLevel,
  onUpdatePayLevelRate,
  payLevelRates,
  weekStart,
}: EmployeeDirectoryProps) {
  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRoles, setNewRoles] = useState<Role[]>([]);
  const [newLevel, setNewLevel] = useState<PayLevel>(1);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRoles, setEditRoles] = useState<Role[]>([]);
  const [editLevel, setEditLevel] = useState<PayLevel>(1);
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  async function handleAddSubmit() {
    const trimmedName = newName.trim();
    if (!trimmedName || newRoles.length === 0 || !newPassword) return;
    if (newPassword !== newPasswordConfirm) return;

    setIsAdding(true);
    setAddError("");

    try {
      await onAddEmployee(trimmedName, newRoles, newLevel, newPassword);
      setNewName("");
      setNewRoles([]);
      setNewLevel(1);
      setNewPassword("");
      setNewPasswordConfirm("");
      setShowAddForm(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add employee.");
    } finally {
      setIsAdding(false);
    }
  }

  function startEdit(employee: Employee) {
    setEditingId(employee.id);
    setEditName(employee.name);
    setEditRoles(employee.roles);
    setEditLevel(employee.level);
    setEditPassword("");
    setEditPasswordConfirm("");
    setEditError("");
    setConfirmDeleteId(null);
    setShowAddForm(false);
  }

  async function handleEditSave() {
    if (!editingId || !editName.trim() || editRoles.length === 0) return;
    if (editPassword && editPassword !== editPasswordConfirm) return;

    setIsSaving(true);
    setEditError("");

    try {
      await onEditEmployee(editingId, {
        name: editName.trim(),
        roles: editRoles,
        level: editLevel,
        password: editPassword || undefined,
      });
      setEditingId(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteClick(employeeId: string) {
    if (confirmDeleteId === employeeId) {
      setIsDeletingId(employeeId);
      try {
        await onDeleteEmployee(employeeId);
        setConfirmDeleteId(null);
      } catch {
        setConfirmDeleteId(null);
      } finally {
        setIsDeletingId(null);
      }
    } else {
      setConfirmDeleteId(employeeId);
      setEditingId(null);
    }
  }

  const canAdd =
    newName.trim().length > 0 &&
    newRoles.length > 0 &&
    newPassword.length > 0 &&
    newPassword === newPasswordConfirm;

  const canSaveEdit =
    editName.trim().length > 0 &&
    editRoles.length > 0 &&
    (editPassword === "" || editPassword === editPasswordConfirm);

  const passwordMismatchAdd = newPasswordConfirm.length > 0 && newPassword !== newPasswordConfirm;
  const passwordMismatchEdit = editPasswordConfirm.length > 0 && editPassword !== editPasswordConfirm;

  return (
    <div className="space-y-4">
      {/* Pay level rates */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-black text-slate-950">Pay level rates</h3>
          <p className="text-sm text-slate-500">Set the hourly wage for each level.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {payLevels.map((level) => (
            <label className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={level}>
              <span className="text-xs font-black text-slate-500">Level {level}</span>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">$</span>
                <input
                  className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  min={0}
                  onChange={(e) => onUpdatePayLevelRate(level, Number(e.target.value))}
                  step={0.5}
                  type="number"
                  value={payLevelRates[level]}
                />
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">Staff ({employees.length})</h3>
        <Button
          onClick={() => {
            setShowAddForm((v) => !v);
            setEditingId(null);
            setConfirmDeleteId(null);
            setAddError("");
          }}
          size="sm"
          variant={showAddForm ? "secondary" : "primary"}
        >
          {showAddForm ? "Cancel" : "Add employee"}
        </Button>
      </div>

      {/* Add employee form */}
      {showAddForm ? (
        <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
          <h4 className="text-sm font-bold text-indigo-900">New employee</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Name
              <input
                autoFocus
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                disabled={isAdding}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full name"
                type="text"
                value={newName}
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Pay level
              <select
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                disabled={isAdding}
                onChange={(e) => setNewLevel(Number(e.target.value) as PayLevel)}
                value={newLevel}
              >
                {payLevels.map((level) => (
                  <option key={level} value={level}>
                    Level {level} — {formatMoney(payLevelRates[level])}/hr
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Password
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                disabled={isAdding}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Login password"
                type="password"
                value={newPassword}
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Confirm password
              <input
                className={cn(
                  "mt-1 h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2",
                  passwordMismatchAdd
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                    : "border-slate-200 focus:border-slate-400 focus:ring-slate-200",
                )}
                disabled={isAdding}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="Re-enter password"
                type="password"
                value={newPasswordConfirm}
              />
              {passwordMismatchAdd ? (
                <span className="mt-1 text-xs text-red-600">Passwords do not match.</span>
              ) : null}
            </label>
          </div>
          <div className="mt-3">
            <p className="text-sm font-semibold text-slate-700">Roles</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm font-semibold transition",
                    newRoles.includes(role)
                      ? roleStyles[role].badge + " border-current"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                  )}
                  disabled={isAdding}
                  key={role}
                  onClick={() =>
                    setNewRoles((current) =>
                      current.includes(role)
                        ? current.filter((r) => r !== role)
                        : [...current, role],
                    )
                  }
                  type="button"
                >
                  {roleLabels[role]}
                </button>
              ))}
            </div>
            {newRoles.length === 0 ? (
              <p className="mt-1.5 text-xs text-slate-400">Select at least one role.</p>
            ) : null}
          </div>
          {addError ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {addError}
            </p>
          ) : null}
          <div className="mt-4 flex justify-end">
            <Button disabled={!canAdd || isAdding} onClick={handleAddSubmit}>
              {isAdding ? "Adding…" : "Add employee"}
            </Button>
          </div>
        </section>
      ) : null}

      {/* Staff table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
              <th className="px-4 py-3 font-bold">Employee</th>
              <th className="px-4 py-3 font-bold">Roles</th>
              <th className="px-4 py-3 font-bold">Level</th>
              <th className="px-4 py-3 font-bold">Hourly rate</th>
              <th className="px-4 py-3 font-bold">Weekly availability</th>
              <th className="px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((employee) => {
              const availability = getEmployeeAvailability(availabilities, employee.id, weekStart);
              const hourlyRate = payLevelRates[employee.level];
              const isEditing = editingId === employee.id;
              const isConfirmingDelete = confirmDeleteId === employee.id;
              const isDeleting = isDeletingId === employee.id;

              return (
                <>
                  <tr key={employee.id}>
                    <td className="px-4 py-4 align-top">
                      <p className="font-bold text-slate-950">{employee.name}</p>
                      <p className="mt-1 text-xs text-slate-500">@{employee.username}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {employee.roles.map((role) => (
                          <span
                            className={cn(
                              "inline-flex rounded-md border px-2 py-1 text-xs font-semibold",
                              roleStyles[role].badge,
                            )}
                            key={role}
                          >
                            {roleLabels[role]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <select
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        onChange={(e) =>
                          onUpdateEmployeeLevel(employee.id, Number(e.target.value) as PayLevel)
                        }
                        value={employee.level}
                      >
                        {payLevels.map((level) => (
                          <option key={level} value={level}>
                            Level {level}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 align-top text-sm">
                      <p className="font-black text-slate-950">{formatMoney(hourlyRate)}</p>
                      <p className="mt-1 text-xs text-slate-500">From level {employee.level}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      {availability ? (
                        <div>
                          <p className="mb-2 text-sm text-slate-600">
                            {summarizeAvailability(availability.days)}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {DAYS.map((day) => (
                              <span
                                className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                                key={day.key}
                              >
                                {day.label}: {availabilityLabels[availability.days[day.key]]}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">No availability submitted</span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        <button
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-bold transition",
                            isEditing
                              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700",
                          )}
                          onClick={() => (isEditing ? setEditingId(null) : startEdit(employee))}
                          type="button"
                        >
                          {isEditing ? "Cancel edit" : "Edit"}
                        </button>
                        <button
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-bold transition",
                            isConfirmingDelete
                              ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                              : "border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-600",
                          )}
                          disabled={isDeleting}
                          onClick={() => handleDeleteClick(employee.id)}
                          type="button"
                        >
                          {isDeleting
                            ? "Deleting…"
                            : isConfirmingDelete
                              ? "Confirm delete"
                              : "Delete"}
                        </button>
                        {isConfirmingDelete && !isDeleting ? (
                          <button
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
                            onClick={() => setConfirmDeleteId(null)}
                            type="button"
                          >
                            Cancel
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>

                  {/* Inline edit panel */}
                  {isEditing ? (
                    <tr key={`${employee.id}-edit`}>
                      <td className="bg-indigo-50 px-4 py-4" colSpan={6}>
                        <p className="mb-3 text-sm font-bold text-indigo-900">
                          Edit — {employee.name}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <label className="text-sm font-semibold text-slate-700">
                            Name
                            <input
                              autoFocus
                              className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                              disabled={isSaving}
                              onChange={(e) => setEditName(e.target.value)}
                              type="text"
                              value={editName}
                            />
                          </label>
                          <label className="text-sm font-semibold text-slate-700">
                            Pay level
                            <select
                              className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                              disabled={isSaving}
                              onChange={(e) => setEditLevel(Number(e.target.value) as PayLevel)}
                              value={editLevel}
                            >
                              {payLevels.map((level) => (
                                <option key={level} value={level}>
                                  Level {level} — {formatMoney(payLevelRates[level])}/hr
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-sm font-semibold text-slate-700">
                            New password
                            <input
                              className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                              disabled={isSaving}
                              onChange={(e) => setEditPassword(e.target.value)}
                              placeholder="Leave blank to keep current"
                              type="password"
                              value={editPassword}
                            />
                          </label>
                          <label className="text-sm font-semibold text-slate-700">
                            Confirm password
                            <input
                              className={cn(
                                "mt-1 h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2",
                                passwordMismatchEdit
                                  ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                                  : "border-slate-200 focus:border-slate-400 focus:ring-slate-200",
                              )}
                              disabled={isSaving}
                              onChange={(e) => setEditPasswordConfirm(e.target.value)}
                              placeholder="Re-enter new password"
                              type="password"
                              value={editPasswordConfirm}
                            />
                            {passwordMismatchEdit ? (
                              <span className="mt-1 text-xs text-red-600">
                                Passwords do not match.
                              </span>
                            ) : null}
                          </label>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm font-semibold text-slate-700">Roles</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {ROLES.map((role) => (
                              <button
                                className={cn(
                                  "rounded-md border px-3 py-1.5 text-sm font-semibold transition",
                                  editRoles.includes(role)
                                    ? roleStyles[role].badge + " border-current"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                                )}
                                disabled={isSaving}
                                key={role}
                                onClick={() =>
                                  setEditRoles((current) =>
                                    current.includes(role)
                                      ? current.filter((r) => r !== role)
                                      : [...current, role],
                                  )
                                }
                                type="button"
                              >
                                {roleLabels[role]}
                              </button>
                            ))}
                          </div>
                          {editRoles.length === 0 ? (
                            <p className="mt-1.5 text-xs text-slate-400">
                              Select at least one role.
                            </p>
                          ) : null}
                        </div>

                        {editError ? (
                          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {editError}
                          </p>
                        ) : null}

                        <div className="mt-4 flex gap-2">
                          <Button disabled={!canSaveEdit || isSaving} onClick={handleEditSave}>
                            {isSaving ? "Saving…" : "Save changes"}
                          </Button>
                          <Button onClick={() => setEditingId(null)} variant="secondary">
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
