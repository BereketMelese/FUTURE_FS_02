import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import LeadForm from "../components/Leads/LeadForm";
import LeadList from "../components/Leads/LeadList";
import LeadDetail from "../components/Leads/LeadDetail";
import Modal from "../components/Ui/Modal";
import {
  addNote,
  createLead,
  deleteLead,
  fetchLeads,
  fetchLeadStatusOptions,
  updateLeadFollowUpdate,
  updateLeadStatus,
} from "../services/api";

const FEEDBACK_DURATION = 3200;

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isUpdatingFollowUp, setIsUpdatingFollowUp] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [feedbackProgress, setFeedbackProgress] = useState(100);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusOptionsByStatus, setStatusOptionsByStatus] = useState({});

  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message, id: Date.now() });
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const feedbackRoot =
    typeof document !== "undefined"
      ? document.getElementById("modal-root") || document.body
      : null;

  const selectedLead = useMemo(
    () => leads.find((lead) => lead._id === selectedLeadId) || null,
    [leads, selectedLeadId],
  );

  const getStatusOptions = useCallback(
    (status) => statusOptionsByStatus[status] || [],
    [statusOptionsByStatus],
  );

  const ensureStatusOptions = useCallback(
    async (status) => {
      if (!status || statusOptionsByStatus[status]) {
        return statusOptionsByStatus[status] || [];
      }

      try {
        const options = await fetchLeadStatusOptions(status);
        setStatusOptionsByStatus((current) => {
          if (current[status]) {
            return current;
          }

          return {
            ...current,
            [status]: options,
          };
        });
        return options;
      } catch {
        setStatusOptionsByStatus((current) => ({
          ...current,
          [status]: [],
        }));
        return [];
      }
    },
    [statusOptionsByStatus],
  );

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetchLeads();
      const fetchedLeads = response.data?.leads || [];
      setLeads(fetchedLeads);
      setSelectedLeadId((current) =>
        current && !fetchedLeads.some((lead) => lead._id === current)
          ? null
          : current,
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load leads right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    if (!feedback?.id) {
      return undefined;
    }

    setFeedbackProgress(100);

    const raf = window.requestAnimationFrame(() => {
      setFeedbackProgress(0);
    });

    const timer = window.setTimeout(() => {
      clearFeedback();
    }, FEEDBACK_DURATION);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [clearFeedback, feedback?.id]);

  useEffect(() => {
    const uniqueStatuses = [...new Set(leads.map((lead) => lead.status))];

    uniqueStatuses.forEach((status) => {
      ensureStatusOptions(status);
    });
  }, [ensureStatusOptions, leads]);

  useEffect(() => {
    if (!selectedLead?.status) {
      return;
    }

    ensureStatusOptions(selectedLead.status);
  }, [ensureStatusOptions, selectedLead?.status]);

  const handleCreateLead = async (formData) => {
    setIsCreating(true);

    try {
      const response = await createLead(formData);
      const newLead = response.data?.lead;

      if (newLead) {
        setLeads((current) => [newLead, ...current]);
        setSelectedLeadId(newLead._id);
      }

      setIsCreateModalOpen(false);
      showFeedback("success", "Lead created successfully.");
      return { success: true };
    } catch (requestError) {
      showFeedback(
        "error",
        requestError.response?.data?.message ||
          "Could not create lead right now.",
      );
      return {
        success: false,
        message:
          requestError.response?.data?.message ||
          "Could not create lead right now.",
      };
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await updateLeadStatus(id, status);
      const updatedLead = response.data?.lead;

      if (updatedLead) {
        setLeads((current) =>
          current.map((lead) =>
            lead._id === updatedLead._id ? updatedLead : lead,
          ),
        );
      }

      showFeedback("success", "Lead status updated.");
    } catch (requestError) {
      showFeedback(
        "error",
        requestError.response?.data?.message || "Unable to update lead status.",
      );
    }
  };

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm("Delete this lead permanently?");

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteLead(id);
      setLeads((current) => current.filter((lead) => lead._id !== id));

      if (selectedLeadId === id) {
        setSelectedLeadId(null);
      }

      showFeedback("success", "Lead deleted.");
    } catch (requestError) {
      showFeedback(
        "error",
        requestError.response?.data?.message || "Unable to delete lead.",
      );
    }
  };

  const handleAddNote = async (id, content) => {
    setIsSavingNote(true);

    try {
      const response = await addNote(id, content);
      const updatedLead = response.data?.lead;

      if (updatedLead) {
        setLeads((current) =>
          current.map((lead) =>
            lead._id === updatedLead._id ? updatedLead : lead,
          ),
        );
      }

      showFeedback("success", "Note added to lead.");
      return { success: true };
    } catch (requestError) {
      showFeedback(
        "error",
        requestError.response?.data?.message || "Unable to add note.",
      );
      return {
        success: false,
        message: requestError.response?.data?.message || "Unable to add note.",
      };
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleFollowUpChange = async (id, followUpdate) => {
    const currentLead = leads.find((lead) => lead._id === id);

    if (currentLead?.status === "Lost") {
      const message = "Follow-up date cannot be set for lost leads.";
      showFeedback("error", message);
      return {
        success: false,
        message,
      };
    }

    setIsUpdatingFollowUp(true);

    try {
      const response = await updateLeadFollowUpdate(id, followUpdate);
      const updatedLead = response.data?.lead;

      if (updatedLead) {
        setLeads((current) =>
          current.map((lead) =>
            lead._id === updatedLead._id ? updatedLead : lead,
          ),
        );
      }

      showFeedback(
        "success",
        followUpdate ? "Follow-up date updated." : "Follow-up date cleared.",
      );
      return { success: true };
    } catch (requestError) {
      showFeedback(
        "error",
        requestError.response?.data?.message ||
          "Unable to update follow-up date.",
      );
      return {
        success: false,
        message:
          requestError.response?.data?.message ||
          "Unable to update follow-up date.",
      };
    } finally {
      setIsUpdatingFollowUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#0f766e_145%)] p-6 text-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.82)] lg:grid-cols-[1.5fr_0.9fr] lg:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/90">
            Pipeline management
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Track leads from first touch to conversion.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Create leads, update status based on progression rules, and keep
            call notes in one place for clean team handoffs.
          </p>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Create Lead
          </button>
        </div>

        <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur">
          <div className="rounded-2xl bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
              Total leads
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {leads.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white/8 p-4 text-sm text-slate-200">
            Converted:{" "}
            {leads.filter((lead) => lead.status === "Converted").length}
            <br />
            Qualified:{" "}
            {leads.filter((lead) => lead.status === "Qualified").length}
          </div>
        </div>
      </section>

      {feedback &&
        feedbackRoot &&
        createPortal(
          <div className="fixed left-1/2 top-20 z-90 w-[min(92vw,640px)] -translate-x-1/2">
            <div
              className={`relative overflow-hidden rounded-2xl border px-4 py-3 pr-12 text-sm font-medium shadow-lg backdrop-blur ${
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50/95 text-emerald-800"
                  : "border-rose-200 bg-rose-50/95 text-rose-800"
              }`}
            >
              {feedback.message}
              <button
                type="button"
                onClick={clearFeedback}
                className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                  feedback.type === "success"
                    ? "text-emerald-700 hover:bg-emerald-100"
                    : "text-rose-700 hover:bg-rose-100"
                }`}
                aria-label="Dismiss feedback"
              >
                x
              </button>

              <div
                className={`pointer-events-none absolute bottom-0 left-0 h-1 transition-[width] ease-linear ${
                  feedback.type === "success" ? "bg-emerald-500" : "bg-rose-500"
                }`}
                style={{
                  width: `${feedbackProgress}%`,
                  transitionDuration: `${FEEDBACK_DURATION}ms`,
                }}
              />
            </div>
          </div>,
          feedbackRoot,
        )}

      <LeadList
        leads={leads}
        isLoading={isLoading}
        error={error}
        onRetry={loadLeads}
        onDelete={handleDelete}
        onView={(lead) => setSelectedLeadId(lead._id)}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create lead"
      >
        <LeadForm onSubmit={handleCreateLead} isSubmitting={isCreating} />
      </Modal>

      <Modal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLeadId(null)}
        title="Lead details"
      >
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLeadId(null)}
          onStatusChange={handleStatusChange}
          statusOptions={getStatusOptions(selectedLead?.status)}
          onFollowUpChange={handleFollowUpChange}
          onAddNote={handleAddNote}
          followUpSubmitting={isUpdatingFollowUp}
          noteSubmitting={isSavingNote}
        />
      </Modal>
    </div>
  );
};

export default Leads;
