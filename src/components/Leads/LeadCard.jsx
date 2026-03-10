const statusTone = {
  New: "bg-sky-100 text-sky-800",
  Contacted: "bg-amber-100 text-amber-800",
  Qualified: "bg-violet-100 text-violet-800",
  Converted: "bg-emerald-100 text-emerald-800",
  Lost: "bg-rose-100 text-rose-800",
};

const formatDate = (value, options) => {
  if (!value) return "Not set";

  return new Date(value).toLocaleDateString(
    "en-US",
    options || {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
};

const getFollowUpMeta = (followUpdate) => {
  if (!followUpdate) {
    return {
      label: "Not scheduled",
      tone: "text-slate-500",
      isOverdue: false,
    };
  }

  const followDate = new Date(followUpdate);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfFollowDay = new Date(
    followDate.getFullYear(),
    followDate.getMonth(),
    followDate.getDate(),
  );

  const dayDelta = Math.round(
    (startOfFollowDay.getTime() - startOfToday.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (dayDelta < 0) {
    return {
      label: `${Math.abs(dayDelta)} day(s) overdue`,
      tone: "text-rose-600",
      isOverdue: true,
    };
  }

  if (dayDelta === 0) {
    return {
      label: "Due today",
      tone: "text-amber-600",
      isOverdue: false,
    };
  }

  return {
    label: `In ${dayDelta} day(s)`,
    tone: "text-emerald-600",
    isOverdue: false,
  };
};

const LeadCard = ({
  lead,
  onDelete,
  onView,
  onStatusChange,
  onFollowUpChange,
  statusOptions = [],
  isPending = false,
  rowError = "",
}) => {
  if (!lead) return null;

  const notesCount = lead.notes?.length || 0;
  const badgeTone = statusTone[lead.status] || "bg-slate-100 text-slate-700";
  const isLost = lead.status === "Lost";
  const followMeta = getFollowUpMeta(lead.followUpdate);

  return (
    <tr className="border-b border-slate-100 align-top transition hover:bg-slate-50/70">
      <td className="px-4 py-3">
        <p className="font-semibold text-slate-900">{lead.name}</p>
        <p className="text-sm text-slate-600">{lead.email}</p>
        {lead.phone && <p className="text-sm text-slate-500">{lead.phone}</p>}
      </td>

      <td className="px-4 py-3">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {lead.source || "Other"}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="grid gap-2">
          <span
            className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${badgeTone}`}
          >
            {lead.status || "New"}
          </span>
          {isLost ? (
            <span className="text-xs font-semibold text-rose-700">
              Status locked
            </span>
          ) : (
            <select
              value=""
              onChange={(event) => {
                const nextStatus = event.target.value;
                if (!nextStatus) return;
                onStatusChange?.(lead._id, nextStatus);
              }}
              disabled={isPending}
              className="h-9 min-w-36 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-700"
            >
              <option value="">Next status</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        {!isLost ? (
          <div className="grid gap-2">
            <input
              type="date"
              value={lead.followUpdate ? lead.followUpdate.slice(0, 10) : ""}
              onChange={(event) =>
                onFollowUpChange?.(lead._id, event.target.value || null)
              }
              disabled={isPending}
              className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-700"
            />
            <p className={`mt-1 text-xs font-semibold ${followMeta.tone}`}>
              {followMeta.label}
            </p>
          </div>
        ) : (
          <p className="mt-1 text-xs font-semibold text-rose-700">Disabled</p>
        )}
      </td>

      <td className="px-4 py-3 text-sm font-medium text-slate-700">
        {notesCount}
      </td>

      <td className="px-4 py-3 text-sm text-slate-600">
        {formatDate(lead.createdAt)}
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onView?.(lead)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(lead._id)}
            disabled={isPending}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Delete
          </button>
        </div>
        {rowError && (
          <p className="mt-2 max-w-44 text-xs font-medium text-rose-700">
            {rowError}
          </p>
        )}
      </td>
    </tr>
  );
};

export default LeadCard;
