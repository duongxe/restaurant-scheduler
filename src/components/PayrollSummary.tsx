import type {
  Employee,
  PayLevelRates,
  PenaltyRates,
  WeekSchedule,
} from "../types/schedule";
import { cn } from "../utils/classNames";
import {
  formatHours,
  formatMoney,
  formatWeekRange,
  getPayrollRows,
  getPayrollTotals,
  roleLabels,
  roleStyles,
} from "../utils/schedule";

interface PayrollSummaryProps {
  employees: Employee[];
  onUpdatePenaltyRate: (key: keyof PenaltyRates, value: number) => void;
  payLevelRates: PayLevelRates;
  penaltyRates: PenaltyRates;
  schedule: WeekSchedule;
  weekStart: string;
}

const penaltyRateLabels: Record<keyof PenaltyRates, string> = {
  weekday: "Weekday",
  saturday: "Saturday",
  sunday: "Sunday",
  publicHoliday: "Public Holiday",
};

export function PayrollSummary({
  employees,
  onUpdatePenaltyRate,
  payLevelRates,
  penaltyRates,
  schedule,
  weekStart,
}: PayrollSummaryProps) {
  const rows = getPayrollRows(schedule, employees, payLevelRates, penaltyRates);
  const totals = getPayrollTotals(schedule, employees, payLevelRates, penaltyRates);

  function handleSavePdf() {
    const weekLabel = formatWeekRange(weekStart);

    const tableRows = rows
      .map(
        (row) => `
      <tr>
        <td>${row.employee.name}<br/><span style="font-size:10px;color:#64748b">${row.employee.roles.map((r) => roleLabels[r]).join(", ")}</span></td>
        <td>${formatHours(row.weekdayHours)}h<br/><span style="font-size:10px;color:#64748b">${formatMoney(row.weekdayPay)}</span></td>
        <td>${formatHours(row.saturdayHours)}h<br/><span style="font-size:10px;color:#64748b">${formatMoney(row.saturdayPay)}</span></td>
        <td>${formatHours(row.sundayHours)}h<br/><span style="font-size:10px;color:#64748b">${formatMoney(row.sundayPay)}</span></td>
        <td>${formatHours(row.publicHolidayHours)}h<br/><span style="font-size:10px;color:#64748b">${formatMoney(row.publicHolidayPay)}</span></td>
        <td><strong>${formatHours(row.paidHours)}h</strong></td>
        <td style="text-align:right"><strong>${formatMoney(row.grossPay)}</strong></td>
      </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Payroll — ${weekLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12px; color: #1e293b; padding: 32px; }
    h1 { font-size: 20px; font-weight: 800; color: #0f172a; }
    .subtitle { margin-top: 4px; font-size: 12px; color: #64748b; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
    .metric { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; }
    .metric-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .metric-value { font-size: 16px; font-weight: 800; margin-top: 4px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    thead tr { background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
    th { padding: 8px 10px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; font-size: 11px; }
    tr:last-child td { border-bottom: none; }
    .total-row { background: #f8fafc; font-weight: 700; border-top: 2px solid #e2e8f0; }
    .total-row td { font-size: 12px; color: #0f172a; }
    .footer { margin-top: 20px; font-size: 10px; color: #94a3b8; }
    @media print {
      body { padding: 20px; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <h1>Sushi Revolution — Weekly Payroll</h1>
  <p class="subtitle">${weekLabel}</p>

  <div class="metrics">
    <div class="metric"><div class="metric-label">Paid hours</div><div class="metric-value">${formatHours(totals.paidHours)}h</div></div>
    <div class="metric"><div class="metric-label">Estimated total</div><div class="metric-value">${formatMoney(totals.grossPay)}</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Employee</th>
        <th>Weekday</th>
        <th>Saturday</th>
        <th>Sunday</th>
        <th>Public Holiday</th>
        <th>Paid hours</th>
        <th style="text-align:right">Estimated pay</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
      <tr class="total-row">
        <td>Total</td>
        <td>${formatHours(totals.weekdayHours)}h</td>
        <td>${formatHours(totals.saturdayHours)}h</td>
        <td>${formatHours(totals.sundayHours)}h</td>
        <td>${formatHours(totals.publicHolidayHours)}h</td>
        <td>${formatHours(totals.paidHours)}h</td>
        <td style="text-align:right">${formatMoney(totals.grossPay)}</td>
      </tr>
    </tbody>
  </table>

  <p class="footer">
    Base pay estimate only. Does not include casual loading, overtime, public holidays, allowances, superannuation, or tax.<br/>
    Generated ${new Date().toLocaleString("en-AU")}
  </p>

  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Weekly Payroll</h2>
          <p className="text-sm text-slate-600">
            Base pay estimate for {formatWeekRange(weekStart)}. Unpaid break time
            is removed before pay is calculated. A 1h break is added by default
            when a staff member is scheduled over 6h in one day.
          </p>
        </div>
        <button
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          onClick={handleSavePdf}
          type="button"
        >
          Save as PDF
        </button>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Penalty rate multipliers</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Multiplier applied to the base hourly rate for each day type.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(penaltyRateLabels) as Array<keyof PenaltyRates>).map((key) => (
            <label
              className={cn(
                "rounded-lg border p-3",
                key === "publicHoliday"
                  ? "border-orange-200 bg-orange-50"
                  : "border-slate-200 bg-slate-50",
              )}
              key={key}
            >
              <span className={cn(
                "text-xs font-black",
                key === "publicHoliday" ? "text-orange-700" : "text-slate-500",
              )}>
                {penaltyRateLabels[key]}
              </span>
              <div className="mt-2 flex items-center gap-1.5">
                <input
                  className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  min={0}
                  onChange={(e) => onUpdatePenaltyRate(key, Number(e.target.value))}
                  step={0.05}
                  type="number"
                  value={penaltyRates[key]}
                />
                <span className="text-sm font-bold text-slate-500">×</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                = {formatMultiplier(penaltyRates[key])} of base rate
              </p>
            </label>
          ))}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PayrollMetric
          label="Paid hours"
          value={`${formatHours(totals.paidHours)}h`}
        />
        <PayrollMetric
          label="Weekday paid"
          value={`${formatHours(totals.weekdayHours)}h`}
        />
        <PayrollMetric
          label="Saturday paid"
          value={`${formatHours(totals.saturdayHours)}h`}
        />
        <PayrollMetric
          label="Sunday paid"
          value={`${formatHours(totals.sundayHours)}h`}
        />
        {totals.publicHolidayHours > 0 ? (
          <PayrollMetric
            label="Public holiday"
            value={`${formatHours(totals.publicHolidayHours)}h`}
          />
        ) : null}
        <PayrollMetric label="Estimated total" value={formatMoney(totals.grossPay)} />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        This MVP uses the hourly rates set in Employees as the ordinary weekday
        base rate. Weekend defaults are permanent ordinary-hour estimates:
        weekday {formatMultiplier(penaltyRates.weekday)},
        Saturday {formatMultiplier(penaltyRates.saturday)}, Sunday{" "}
        {formatMultiplier(penaltyRates.sunday)}, Public Holiday{" "}
        {formatMultiplier(penaltyRates.publicHoliday)}. It does not yet
        calculate casual loading, overtime, public holidays, allowances,
        superannuation, tax, or award classifications automatically. Check the{" "}
        <a
          className="font-bold underline underline-offset-2"
          href="https://calculate.fairwork.gov.au/"
          rel="noreferrer"
          target="_blank"
        >
          Fair Work Pay and Conditions Tool
        </a>{" "}
        before final payroll.
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Employee</th>
                <th className="px-4 py-3 font-bold">Weekday</th>
                <th className="px-4 py-3 font-bold">Saturday</th>
                <th className="px-4 py-3 font-bold">Sunday</th>
                <th className="px-4 py-3 font-bold text-orange-700">Public Holiday</th>
                <th className="px-4 py-3 font-bold">Paid hours</th>
                <th className="px-4 py-3 text-right font-bold">Estimated pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr className="hover:bg-slate-50" key={row.employee.id}>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">
                      {row.employee.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {row.employee.roles.map((role) => (
                        <span
                          className={cn(
                            "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold",
                            roleStyles[role].badge,
                          )}
                          key={role}
                        >
                          {roleLabels[role]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <PayrollDayCell
                      hours={row.weekdayHours}
                      pay={row.weekdayPay}
                      rate={row.hourlyRate * penaltyRates.weekday}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <PayrollDayCell
                      hours={row.saturdayHours}
                      pay={row.saturdayPay}
                      rate={row.hourlyRate * penaltyRates.saturday}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <PayrollDayCell
                      hours={row.sundayHours}
                      pay={row.sundayPay}
                      rate={row.hourlyRate * penaltyRates.sunday}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <PayrollDayCell
                      hours={row.publicHolidayHours}
                      pay={row.publicHolidayPay}
                      rate={row.hourlyRate * penaltyRates.publicHoliday}
                    />
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {formatHours(row.paidHours)}h
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold text-slate-900">
                    {formatMoney(row.grossPay)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        Later backend payroll should store award classification, employment
        type, penalty rates, overtime, allowances, tax, superannuation, and
        approved roster/payment records before final payment.
      </div>
    </section>
  );
}

function PayrollMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function PayrollDayCell({
  hours,
  pay,
  rate,
}: {
  hours: number;
  pay: number;
  rate: number;
}) {
  return (
    <div>
      <p className="font-bold text-slate-900">{formatHours(hours)}h</p>
      <p className="mt-0.5 text-xs text-slate-500">{formatMoney(rate)}/h</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-700">
        {formatMoney(pay)}
      </p>
    </div>
  );
}

function formatMultiplier(value: number) {
  return `${Math.round(value * 100)}%`;
}
