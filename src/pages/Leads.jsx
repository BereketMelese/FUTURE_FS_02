import { useCallback, useEffect, useMemo, useState } from "react";
import LeadForm from "../components/Leads/LeadForm";
import LeadList from "../components/Leads/LeadList";
import LeadDetail from "../components/Leads/LeadDetail";
import Modal from "../components/Ui/Modal";
import {
  addNote,
  createLead,
  deleteLead,
  fetchLeads,
  updateLeadStatus,
} from "../services/api";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead._id === selectedLeadId) || null,
    [leads, selectedLeadId],
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
    if (!feedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setFeedback(""), 2400);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleCreateLead = async (formData) => {
    setIsCreating(true);

    try {
      const response = await createLead(formData);
      const newLead = response.data?.lead;

      if (newLead) {
        setLeads((current) => [newLead, ...current]);
        setSelectedLeadId(newLead._id);
      }

      setFeedback("Lead created successfully.");
      return { success: true };
    } catch (requestError) {
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

      setFeedback("Lead status updated.");
    } catch (requestError) {
      setFeedback(
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

      setFeedback("Lead deleted.");
    } catch (requestError) {
      setFeedback(
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

      setFeedback("Note added to lead.");
      return { success: true };
    } catch (requestError) {
      return {
        success: false,
        message: requestError.response?.data?.message || "Unable to add note.",
      };
    } finally {
      setIsSavingNote(false);
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

      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {feedback}
        </div>
      )}

      <section className="grid gap-6">
        <LeadForm onSubmit={handleCreateLead} isSubmitting={isCreating} />
      </section>

      <LeadList
        leads={leads}
        isLoading={isLoading}
        error={error}
        onRetry={loadLeads}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onView={(lead) => setSelectedLeadId(lead._id)}
      />

      <Modal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLeadId(null)}
        title="Lead details"
      >
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLeadId(null)}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
          noteSubmitting={isSavingNote}
        />
      </Modal>
    </div>
  );
};

export default Leads;
