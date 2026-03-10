import { useMemo, useState } from "react";
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

const sortOptions = {
  newest: "Newest first",
  oldest: "Oldest first",
  nameAsc: "Name A-Z",
  nameDesc: "Name Z-A",
};

const normalize = (value) => (value || "").toString().toLowerCase();

const LeadList = ({
  leads = [],
  isLoading = false,
  error = "",
  onRetry,
  onStatusChange,
  onDelete,
  onView,
}) => {
  const [activeStatus, setActiveStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredLeads = useMemo(() => {
    const normalizedQuery = normalize(query).trim();

    const nextLeads = leads
      .filter((lead) => {
        if (activeStatus !== "All" && lead.status !== activeStatus) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = [lead.name, lead.email, lead.phone, lead.source]
          .map(normalize)
          .join(" ");

        return haystack.includes(normalizedQuery);
      })
      .slice();

    if (sortBy === "newest") {
      nextLeads.sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );
    }

    if (sortBy === "oldest") {
      nextLeads.sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime(),
      );
    }

    if (sortBy === "nameAsc") {
      nextLeads.sort((left, right) =>
        normalize(left.name).localeCompare(normalize(right.name)),
      );
    }

    if (sortBy === "nameDesc") {
      nextLeads.sort((left, right) =>
        normalize(right.name).localeCompare(normalize(left.name)),
      );
    }

    return nextLeads;
  }, [activeStatus, leads, query, sortBy]);

  const totalCount = leads.length;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Pipeline
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Lead list
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {filteredLeads.length} of {totalCount} leads shown
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="text-slate-500" htmlFor="lead-sort">
            Sort by
          </label>
          <select
            id="lead-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
          >
            {Object.entries(sortOptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, email, phone, or source"
          className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
        />

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
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
      </div>

      {isLoading ? (
        <div className="mt-8 flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loading size="lg" />
            <p className="text-sm">Loading leads...</p>
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
      ) : filteredLeads.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
          <p className="text-base font-semibold text-slate-700">
            No leads found
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Try adjusting filters or create a new lead to get started.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead._id}
              lead={lead}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default LeadList;
