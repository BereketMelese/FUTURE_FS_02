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

const LeadCard = ({ lead, onStatusChange, onDelete, onView }) => {
  if (!lead) return null;

  const notesCount = lead.notes?.length || 0;
  const badgeTone = statusTone[lead.status] || "bg-slate-100 text-slate-700";

  return (
    <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold tracking-tight text-slate-900">
            {lead.name}
          </p>
          <p className="mt-1 truncate text-sm text-slate-600">{lead.email}</p>
          {lead.phone && (
            <p className="mt-1 text-sm text-slate-500">{lead.phone}</p>
          )}
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badgeTone}`}
        >
          {lead.status || "New"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Source
          </p>
          <p className="mt-1 font-medium text-slate-700">
            {lead.source || "Other"}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Notes
          </p>
          <p className="mt-1 font-medium text-slate-700">{notesCount}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-3 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-500">Created</span>
          <span className="font-medium text-slate-700">
            {formatDate(lead.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-500">Follow-up</span>
          <span className="font-medium text-slate-700">
            {formatDate(lead.followUpdate)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Update status
        </label>
        <select
          value={lead.status || "New"}
          onChange={(event) => onStatusChange?.(lead._id, event.target.value)}
          className="h-11 rounded-2xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onView?.(lead)}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          View
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(lead._id)}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          Delete
        </button>
      </div>
    </article>
  );
};

export default LeadCard;
