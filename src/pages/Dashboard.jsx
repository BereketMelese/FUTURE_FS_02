import { useCallback, useEffect, useState } from "react";
import { fetchLeadAggregates } from "../services/api";
import { useAuth } from "../hooks/authContextHooks";
import Loading from "../components/Ui/Loading";

const statusConfig = {
  New: { tone: "bg-sky-100 text-sky-800", accent: "bg-sky-500" },
  Contacted: {
    tone: "bg-amber-100 text-amber-800",
    accent: "bg-amber-500",
  },
  Qualified: {
    tone: "bg-violet-100 text-violet-800",
    accent: "bg-violet-500",
  },
  Converted: {
    tone: "bg-emerald-100 text-emerald-800",
    accent: "bg-emerald-500",
  },
  Lost: { tone: "bg-rose-100 text-rose-800", accent: "bg-rose-500" },
};

const numberFormatter = new Intl.NumberFormat("en-US");

const formatDate = (value, options) => {
  if (!value) return "Not scheduled";

  return new Date(value).toLocaleDateString(
    "en-US",
    options || {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    total: 0,
    totalNotes: 0,
    convertedCount: 0,
    activeCount: 0,
    lostCount: 0,
    conversionRate: 0,
    overdueFollowUps: 0,
    statusBreakdown: Object.keys(statusConfig).map((status) => ({
      status,
      count: 0,
      percentage: 0,
      ...statusConfig[status],
    })),
    topSources: [],
    upcomingFollowUps: [],
    recentLeads: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetchLeadAggregates({ signal });
      const data = response.data || {};

      setDashboardData({
        total: data.total || 0,
        totalNotes: data.totalNotes || 0,
        convertedCount: data.convertedCount || 0,
        activeCount: data.activeCount || 0,
        lostCount: data.lostCount || 0,
        conversionRate: data.conversionRate || 0,
        overdueFollowUps: data.overdueFollowUps || 0,
        statusBreakdown: (data.statusBreakdown || []).map((item) => ({
          ...item,
          ...statusConfig[item.status],
        })),
        topSources: data.topSources || [],
        upcomingFollowUps: data.upcomingFollowUps || [],
        recentLeads: data.recentLeads || [],
      });
    } catch (requestError) {
      if (
        requestError.name === "CanceledError" ||
        requestError.code === "ERR_CANCELED"
      ) {
        return;
      }

      setError(
        requestError.response?.data?.message ||
          "Unable to load dashboard data right now.",
      );
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadDashboard(controller.signal);
    return () => controller.abort();
  }, [loadDashboard]);

  const summaryCards = [
    {
      label: "Total leads",
      value: numberFormatter.format(dashboardData.total),
      detail: `${dashboardData.activeCount} active in pipeline`,
    },
    {
      label: "Converted",
      value: numberFormatter.format(dashboardData.convertedCount),
      detail: `${dashboardData.conversionRate}% conversion rate`,
    },
    {
      label: "Notes logged",
      value: numberFormatter.format(dashboardData.totalNotes),
      detail: "Conversation history across all leads",
    },
    {
      label: "Follow-ups overdue",
      value: numberFormatter.format(dashboardData.overdueFollowUps),
      detail: `${dashboardData.lostCount} leads marked lost`,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#0f766e_140%)] p-6 text-white shadow-[0_25px_70px_-35px_rgba(15,23,42,0.85)] lg:grid-cols-[1.6fr_0.9fr] lg:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/90">
            Overview
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {user?.username
              ? `Welcome back, ${user.username}.`
              : "Welcome back."}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            This dashboard summarizes your pipeline from first-touch leads to
            conversion, with follow-up pressure and recent activity visible at a
            glance.
          </p>
        </div>

        <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Pipeline health</span>
            <span>{dashboardData.conversionRate}% converted</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-300 via-emerald-300 to-amber-200"
              style={{ width: `${Math.max(dashboardData.conversionRate, 8)}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-slate-300">Active leads</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {dashboardData.activeCount}
              </p>
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-slate-300">Upcoming follow-ups</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {dashboardData.upcomingFollowUps.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex min-h-72 items-center justify-center rounded-[28px] border border-slate-200 bg-white/80">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loading size="lg" />
            <p className="text-sm font-medium">Loading dashboard data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <h3 className="text-lg font-semibold">Dashboard unavailable</h3>
          <p className="mt-2 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => loadDashboard()}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <article
                key={card.label}
                className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                  {card.value}
                </p>
                <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Lead status pipeline
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                    Distribution by stage
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  {dashboardData.total} total
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                {dashboardData.statusBreakdown.map((item) => (
                  <div key={item.status} className="grid gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}
                        >
                          {item.status}
                        </span>
                        <span className="text-slate-600">
                          {item.count} leads
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${item.accent}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Lead sources</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Top acquisition channels
              </h3>

              {dashboardData.topSources.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  No source data yet. Add your first lead to start tracking
                  channel performance.
                </div>
              ) : (
                <div className="mt-6 grid gap-3">
                  {dashboardData.topSources.map((item) => (
                    <div
                      key={item.source}
                      className="rounded-2xl bg-slate-50 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.source}
                          </p>
                          <p className="text-sm text-slate-500">
                            {item.count} leads
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <article className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Upcoming follow-ups
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Scheduled outreach
              </h3>

              {dashboardData.upcomingFollowUps.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  No follow-ups scheduled yet.
                </div>
              ) : (
                <div className="mt-6 grid gap-3">
                  {dashboardData.upcomingFollowUps.map((lead) => (
                    <div
                      key={lead._id}
                      className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {lead.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {lead.email}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig[lead.status]?.tone || "bg-slate-100 text-slate-700"}`}
                        >
                          {lead.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                        <span>{lead.source || "Other"}</span>
                        <span>{formatDate(lead.followUpdate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Recent leads</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Latest additions to the pipeline
              </h3>

              {dashboardData.recentLeads.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  No leads yet. Create your first one to see activity here.
                </div>
              ) : (
                <div className="mt-6 grid gap-3">
                  {dashboardData.recentLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {lead.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {lead.email}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig[lead.status]?.tone || "bg-slate-100 text-slate-700"}`}
                        >
                          {lead.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Source
                          </p>
                          <p className="mt-1 font-medium text-slate-700">
                            {lead.source || "Other"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Notes
                          </p>
                          <p className="mt-1 font-medium text-slate-700">
                            {lead.notes?.length || 0}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-slate-500">
                        Added {formatDate(lead.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
