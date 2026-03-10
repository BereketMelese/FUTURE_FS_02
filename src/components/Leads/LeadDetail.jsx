import { useState } from "react";

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

const LeadDetail = ({
  lead,
  onClose,
  onStatusChange,
  onAddNote,
  noteSubmitting = false,
}) => {
  const [noteText, setNoteText] = useState("");
  const [localError, setLocalError] = useState("");

  if (!lead) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Select a lead to view full details.
      </section>
    );
  }

  const handleSubmitNote = async (event) => {
    event.preventDefault();
    const content = noteText.trim();

    if (!content) {
      setLocalError("Please enter note content before submitting.");
      return;
    }

    setLocalError("");
    const result = await onAddNote?.(lead._id, content);

    if (result?.success === false) {
      setLocalError(result.message || "Could not add note right now.");
      return;
    }

    setNoteText("");
  };

  const notes = lead.notes || [];
  const badgeTone = statusTone[lead.status] || "bg-slate-100 text-slate-700";

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Lead details
          </p>
          <h3 className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900">
            {lead.name}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{lead.email}</p>
          {lead.phone && (
            <p className="mt-1 text-sm text-slate-500">{lead.phone}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeTone}`}
          >
            {lead.status || "New"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Source
          </p>
          <p className="mt-1 font-semibold text-slate-800">
            {lead.source || "Other"}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Created
          </p>
          <p className="mt-1 font-semibold text-slate-800">
            {formatDate(lead.createdAt)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Follow-up
          </p>
          <p className="mt-1 font-semibold text-slate-800">
            {formatDate(lead.followUpdate)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Notes
          </p>
          <p className="mt-1 font-semibold text-slate-800">{notes.length}</p>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Update status
        </label>
        <select
          value={lead.status || "New"}
          onChange={(event) => onStatusChange?.(lead._id, event.target.value)}
          className="mt-2 h-11 w-full rounded-2xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div className="mt-7">
        <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          Add note
        </h4>

        <form onSubmit={handleSubmitNote} className="mt-3 grid gap-3">
          <textarea
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="Write the latest call summary or follow-up context..."
            rows={4}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
          />

          {localError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {localError}
            </p>
          )}

          <button
            type="submit"
            disabled={noteSubmitting}
            className="inline-flex h-11 items-center justify-center self-start rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {noteSubmitting ? "Saving note..." : "Save note"}
          </button>
        </form>
      </div>

      <div className="mt-7">
        <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          Timeline notes
        </h4>

        {notes.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
            No notes yet. Add one to capture context for the next touchpoint.
          </div>
        ) : (
          <div className="mt-3 grid gap-3">
            {[...notes]
              .sort(
                (left, right) =>
                  new Date(right.createdAt).getTime() -
                  new Date(left.createdAt).getTime(),
              )
              .map((note, index) => (
                <article
                  key={note._id || `${note.createdAt}-${index}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <p className="text-sm leading-relaxed text-slate-700">
                    {note.content}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDate(note.createdAt, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </article>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LeadDetail;
