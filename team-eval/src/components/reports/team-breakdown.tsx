"use client";

interface TeamRow {
  team: string;
  members: number;
  [key: string]: string | number;
}

interface ColumnDef {
  key: string;
  label: string;
  align?: "left" | "right";
  format?: (value: string | number) => string;
}

interface TeamBreakdownProps {
  title: string;
  columns: ColumnDef[];
  data: TeamRow[];
}

export function TeamBreakdown({ title, columns, data }: TeamBreakdownProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500 ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="transition-colors hover:bg-zinc-800/30"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`whitespace-nowrap px-5 py-3 ${
                      col.align === "right" ? "text-right" : "text-left"
                    } ${col.key === "team" ? "font-medium text-zinc-200" : "text-zinc-400"}`}
                  >
                    {col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
