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

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

const inputErrorClass =
  "h-10 w-full rounded-lg border border-rose-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100";

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRoles, setNewRoles] = useState<Role[]>([]);
  const [newLevel, setNewLevel] = useState<PayLevel>(1);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRoles, setEditRoles] = useState<Role[]>([]);
  const [editLevel, setEditLevel] = useState<PayLevel>(1);
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

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
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">Pay level rates</h3>
          <p className="mt-0.5 text-xs text-slate-500">Hourly wage per level.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {payLevels.map((level) => (
            <label className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={level}>
              <span className="text-xs font-bold text-slate-400">Level {level}</span>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-400">$</span>
                <input
                  className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
        <p className="text-sm font-semibold text-slate-500">
          {employees.length} staff members
        </p>
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
          {showAddForm ? "Cancel" : "+ Add employee"}
        </Button>
      </div>

      {/* Add employee form */}
      {showAddForm ? (
        <section className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-5 shadow-sm">
          <h4 className="mb-4 text-sm font-bold text-indigo-900">New employee</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Name
              <input
                autoFocus
                className={cn("mt-1.5", inputClass)}
                disabled={isAdding}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full name"
                type="text"
                value={newName}
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Pay level
              <select
                className={cn("mt-1.5 font-bold", inputClass)}
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
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Password
              <input
                className={cn("mt-1.5", inputClass)}
                disabled={isAdding}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Login password"
                type="password"
                value={newPassword}
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Confirm password
              <input
                className={cn("mt-1.5", passwordMismatchAdd ? inputErrorClass : inputClass)}
                disabled={isAdding}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="Re-enter password"
                type="password"
                value={newPasswordConfirm}
              />
              {passwordMismatchAdd ? (
                <span className="mt-1 block text-xs font-medium text-rose-600">
                  Passwords do not match.
                </span>
              ) : null}
            </label>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Roles</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-semibold transition",
                    newRoles.includes(role)
                      ? roleStyles[role].badge
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700",
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
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {addError}
            </p>
          ) : null}

          <div className="mt-5 flex justify-end">
            <Button disabled={!canAdd || isAdding} onClick={handleAddSubmit}>
              {isAdding ? "Adding…" : "Add employee"}
            </Button>
          </div>
        </section>
      ) : null}

      {/* Staff table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Availability this week</th>
              <th className="px-4 py-3"></th>
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
                  <tr
                    className={cn("transition", isEditing ? "bg-indigo-50/40" : "hover:bg-slate-50/70")}
                    key={employee.id}
                  >
                    <td className="px-4 py-3.5 align-middle">
                      <p className="font-semibold text-slate-900">{employee.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400">@{employee.username}</p>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {employee.roles.map((role) => (
                          <span
                            className={cn(
                              "inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold",
                              roleStyles[role].badge,
                            )}
                            key={role}
                          >
                            {roleLabels[role]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <select
                        className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        onChange={(e) =>
                          onUpdateEmployeeLevel(employee.id, Number(e.target.value) as PayLevel)
                        }
                        value={employee.level}
                      >
                        {payLevels.map((level) => (
                          <option key={level} value={level}>Lv {level}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <p className="font-bold text-slate-900">{formatMoney(hourlyRate)}/h</p>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      {availability ? (
                        <div className="flex gap-1">
                          {DAYS.map((day) => {
                            const val = availability.days[day.key];
                            return (
                              <div key={day.key} className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-400">
                                  {day.label[0]}
                                </span>
                                <span
                                  className={cn(
                                    "h-5 w-5 rounded-md text-[9px] font-bold flex items-center justify-center",
                                    val === "full day"
                                      ? "bg-indigo-100 text-indigo-700"
                                      : val === "morning"
                                      ? "bg-amber-100 text-amber-700"
                                      : val === "night"
                                      ? "bg-slate-200 text-slate-600"
                                      : "bg-slate-100 text-slate-300",
                                  )}
                                  title={availabilityLabels[val]}
                                >
                                  {val === "full day" ? "F" : val === "morning" ? "M" : val === "night" ? "N" : "—"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Not submitted</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-1.5">
                        <button
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                            isEditing
                              ? "border-indigo-200 bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                              : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700",
                          )}
                          onClick={() => (isEditing ? setEditingId(null) : startEdit(employee))}
                          type="button"
                        >
                          {isEditing ? "Cancel" : "Edit"}
                        </button>
                        <button
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                            isConfirmingDelete
                              ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:text-rose-600",
                          )}
                          disabled={isDeleting}
                          onClick={() => handleDeleteClick(employee.id)}
                          type="button"
                        >
                          {isDeleting ? "…" : isConfirmingDelete ? "Confirm?" : "Delete"}
                        </button>
                        {isConfirmingDelete && !isDeleting ? (
                          <button
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
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
                      <td className="border-t border-indigo-100 bg-indigo-50/60 px-5 py-5" colSpan={6}>
                        <p className="mb-4 text-xs font-bold uppercase tracking-wide text-indigo-600">
                          Editing — {employee.name}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Name
                            <input
                              autoFocus
                              className={cn("mt-1.5", inputClass)}
                              disabled={isSaving}
                              onChange={(e) => setEditName(e.target.value)}
                              type="text"
                              value={editName}
                            />
                          </label>
                          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Pay level
                            <select
                              className={cn("mt-1.5 font-bold", inputClass)}
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
                          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            New password
                            <input
                              className={cn("mt-1.5", inputClass)}
                              disabled={isSaving}
                              onChange={(e) => setEditPassword(e.target.value)}
                              placeholder="Leave blank to keep"
                              type="password"
                              value={editPassword}
                            />
                          </label>
                          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Confirm password
                            <input
                              className={cn("mt-1.5", passwordMismatchEdit ? inputErrorClass : inputClass)}
                              disabled={isSaving}
                              onChange={(e) => setEditPasswordConfirm(e.target.value)}
                              placeholder="Re-enter new password"
                              type="password"
                              value={editPasswordConfirm}
                            />
                            {passwordMismatchEdit ? (
                              <span className="mt-1 block text-xs font-medium text-rose-600">
                                Passwords do not match.
                              </span>
                            ) : null}
                          </label>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Roles</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {ROLES.map((role) => (
                              <button
                                className={cn(
                                  "rounded-lg border px-3 py-1.5 text-sm font-semibold transition",
                                  editRoles.includes(role)
                                    ? roleStyles[role].badge
                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
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
                            <p className="mt-1.5 text-xs text-slate-400">Select at least one role.</p>
                          ) : null}
                        </div>

                        {editError ? (
                          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {editError}
                          </p>
                        ) : null}

                        <div className="mt-5 flex gap-2">
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
