import { useState } from "react";

const initialState = {
  name: "",
  email: "",
  phone: "",
  source: "Website",
  followUpdate: "",
};

const sourceOptions = ["Website", "Referral", "Social Media", "Email", "Other"];

const LeadForm = ({ onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      source: formData.source || "Other",
      followUpdate: formData.followUpdate || undefined,
    };

    if (!payload.name || !payload.email) {
      setError("Name and email are required.");
      return;
    }

    const response = await onSubmit?.(payload);

    if (response?.success === false) {
      setError(response.message || "Unable to create lead right now.");
      return;
    }

    setFormData(initialState);
  };

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Create lead
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Add a new prospect to your pipeline
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Capture core contact details so follow-ups and status tracking start
          immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Name *</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Jane Doe"
              className="h-11 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Email *</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="jane@company.com"
              className="h-11 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+251912345678"
              className="h-11 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Source</span>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="h-11 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
            >
              {sourceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1.5 md:max-w-xs">
          <span className="text-sm font-medium text-slate-700">
            Follow-up date
          </span>
          <input
            type="date"
            name="followUpdate"
            value={formData.followUpdate}
            onChange={handleChange}
            className="h-11 rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
          />
        </label>

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating..." : "Create Lead"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default LeadForm;
