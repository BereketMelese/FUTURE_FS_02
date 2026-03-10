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

const LeadCard = ({ lead, onDelete, onView }) => {
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
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeTone}`}
        >
          {isLost ? lead.status || "New" : lead.status || "New"}
        </span>
      </td>

      <td className="px-4 py-3">
        <p className="text-sm font-medium text-slate-700">
          {!isLost && formatDate(lead.followUpdate)}
        </p>
        {!isLost ? (
          <>
            <p className={`mt-1 text-xs font-semibold ${followMeta.tone}`}>
              {followMeta.label}
            </p>
          </>
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
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default LeadCard;
