import LeadCard from "./LeadCard";
import Loading from "../Ui/Loading";

const statusOptions = [
  "All",
  "New",
  "Contacted",
  "Qualified",
  "Converted",
  "Lost",
];
const dueOptions = ["all", "today", "overdue", "upcoming"];

const sortableColumns = {
  Lead: "name",
  Status: "status",
  "Follow-up": "followUpdate",
  Created: "createdAt",
};

const LeadList = ({
  leads = [],
  isLoading = false,
  error = "",
  onRetry,
  query = "",
  onQueryChange,
  activeStatus = "All",
  onFilterStatusChange,
  dueFilter = "all",
  onDueFilterChange,
  sortField = "createdAt",
  sortDirection = "desc",
  onSortChange,
  page = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
  onRowStatusChange,
  onFollowUpChange,
  getStatusOptions,
  rowPending = {},
  rowErrors = {},
  onDelete,
  onView,
}) => {
  const renderSortIndicator = (field) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  const handleColumnSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      onSortChange?.(field, sortDirection === "asc" ? "desc" : "asc");
      return;
    }
    onSortChange?.(field, "desc");
  };

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Pipeline
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Lead table
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {leads.length} of {totalCount} leads shown
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
          placeholder="Search by name, email, phone, or source"
          className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
        />

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onFilterStatusChange?.(status)}
              className={`h-10 rounded-xl px-3 text-sm font-semibold transition ${
                activeStatus === status
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {dueOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onDueFilterChange?.(option)}
              className={`h-10 rounded-xl px-3 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                dueFilter === option
                  ? "bg-cyan-700 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-245 w-full text-left">
            <tbody>
              {Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td colSpan={7} className="px-4 py-4">
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-center py-3 text-slate-500">
            <Loading size="sm" />
          </div>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <p className="font-semibold">Could not load leads</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Try again
          </button>
        </div>
      ) : leads.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
          <p className="text-base font-semibold text-slate-700">
            No leads found
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Try adjusting filters or create a new lead to get started.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-245 w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleColumnSort(sortableColumns.Lead)}
                    className="inline-flex items-center gap-1"
                  >
                    Lead
                    <span>{renderSortIndicator(sortableColumns.Lead)}</span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleColumnSort(sortableColumns.Status)}
                    className="inline-flex items-center gap-1"
                  >
                    Status
                    <span>{renderSortIndicator(sortableColumns.Status)}</span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() =>
                      handleColumnSort(sortableColumns["Follow-up"])
                    }
                    className="inline-flex items-center gap-1"
                  >
                    Follow-up
                    <span>
                      {renderSortIndicator(sortableColumns["Follow-up"])}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Notes</th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleColumnSort(sortableColumns.Created)}
                    className="inline-flex items-center gap-1"
                  >
                    Created
                    <span>{renderSortIndicator(sortableColumns.Created)}</span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm">
              {leads.map((lead) => (
                <LeadCard
                  key={lead._id}
                  lead={lead}
                  onStatusChange={onRowStatusChange}
                  onFollowUpChange={onFollowUpChange}
                  statusOptions={getStatusOptions?.(lead.status) || []}
                  isPending={!!rowPending[lead._id]}
                  rowError={rowErrors[lead._id] || ""}
                  onDelete={onDelete}
                  onView={onView}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPageChange?.(Math.max(1, page - 1))}
            disabled={page <= 1 || isLoading}
            className="h-9 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || isLoading}
            className="h-9 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default LeadList;
