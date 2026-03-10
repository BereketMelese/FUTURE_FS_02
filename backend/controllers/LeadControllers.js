import Lead from "../models/Lead.js";
import { validationResult } from "express-validator";

const STATUS_TRANSITIONS = {
  New: ["Contacted", "Qualified", "Lost"],
  Contacted: ["Qualified", "Lost"],
  Qualified: ["Lost", "Converted"],
  Converted: [],
  Lost: [],
};

const VALID_STATUSES = Object.keys(STATUS_TRANSITIONS);

const sendError = (res, status, code, message, details) =>
  res.status(status).json({
    success: false,
    code,
    message,
    ...(details ? { details } : {}),
  });

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeDateOnly = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const getLeads = async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);
    const status = req.query.status;
    const q = req.query.q?.trim();
    const due = req.query.due;
    const sort = req.query.sort || "createdAt:desc";

    const filter = { createdBy: req.user };

    if (status && status !== "All") {
      if (!VALID_STATUSES.includes(status)) {
        return sendError(res, 400, "INVALID_STATUS", "Invalid status filter");
      }
      filter.status = status;
    }

    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { source: regex },
      ];
    }

    if (due) {
      const today = normalizeDateOnly(new Date());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (due === "today") {
        filter.followUpdate = {
          $gte: today,
          $lt: tomorrow,
        };
      } else if (due === "overdue") {
        filter.followUpdate = {
          $lt: today,
        };
      } else if (due === "upcoming") {
        filter.followUpdate = {
          $gte: tomorrow,
        };
      }
    }

    const [sortFieldRaw, sortDirectionRaw] = sort.split(":");
    const sortFieldMap = {
      createdAt: "createdAt",
      name: "name",
      followUpdate: "followUpdate",
      status: "status",
    };
    const sortField = sortFieldMap[sortFieldRaw] || "createdAt";
    const sortDirection = sortDirectionRaw === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [total, leads] = await Promise.all([
      Lead.countDocuments(filter),
      Lead.find(filter)
        .sort({ [sortField]: sortDirection, _id: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.set("Cache-Control", "private, max-age=20");

    res.json({
      success: true,
      count: leads.length,
      total,
      page,
      limit,
      totalPages,
      leads,
    });
  } catch (error) {
    console.error("❌ Error fetching leads:", error);
    return sendError(res, 500, "SERVER_ERROR", "Server error");
  }
};

export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      createdBy: req.user,
    });

    if (!lead) {
      return sendError(res, 404, "LEAD_NOT_FOUND", "Lead not found");
    }
    res.json({
      success: true,
      lead,
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return sendError(res, 404, "LEAD_NOT_FOUND", "Lead not found");
    }
    return sendError(res, 500, "SERVER_ERROR", "Server error");
  }
};

export const createLead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, "VALIDATION_ERROR", "Validation failed", {
      errors: errors.array(),
    });
  }

  try {
    const { name, email, phone, source, followUpdate } = req.body;
    const existingLead = await Lead.findOne({
      email,
      createdBy: req.user,
    });

    if (existingLead) {
      return sendError(
        res,
        400,
        "LEAD_ALREADY_EXISTS",
        "Lead with this email already exists",
      );
    }

    const newLead = new Lead({
      name,
      email,
      phone,
      source,
      followUpdate: followUpdate || undefined,
      createdBy: req.user,
    });

    const lead = await newLead.save();

    res.status(201).json({
      success: true,
      lead,
    });
  } catch (err) {
    console.error("❌ Error creating lead:", err);
    return sendError(res, 500, "SERVER_ERROR", "Server error");
  }
};

export const updateLead = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "VALIDATION_ERROR", "Validation failed", {
        errors: errors.array(),
      });
    }

    const { status, followUpdate } = req.body;

    const hasStatus = typeof status === "string";
    const hasFollowUpdate = Object.prototype.hasOwnProperty.call(
      req.body,
      "followUpdate",
    );

    if (!hasStatus && !hasFollowUpdate) {
      return sendError(
        res,
        400,
        "MISSING_UPDATE_FIELDS",
        "Provide status and/or followUpdate to update lead",
      );
    }

    if (hasStatus && !VALID_STATUSES.includes(status)) {
      return sendError(res, 400, "INVALID_STATUS", "Invalid status value");
    }

    if (hasFollowUpdate && followUpdate) {
      const parsedDate = new Date(followUpdate);

      if (Number.isNaN(parsedDate.getTime())) {
        return sendError(
          res,
          400,
          "INVALID_FOLLOW_UP_DATE",
          "Invalid followUpdate date",
        );
      }
    }

    let lead = await Lead.findOne({
      _id: req.params.id,
      createdBy: req.user,
    });

    if (!lead) {
      return sendError(res, 404, "LEAD_NOT_FOUND", "Lead not found");
    }

    if (lead.status === "Lost" && hasStatus) {
      return sendError(
        res,
        400,
        "STATUS_LOCKED",
        "Lost leads cannot have status updates",
      );
    }

    const targetStatus = hasStatus ? status : lead.status;

    if (targetStatus === "Lost" && hasFollowUpdate && followUpdate) {
      return sendError(
        res,
        400,
        "FOLLOW_UP_NOT_ALLOWED",
        "Lost leads cannot have a follow-up date",
      );
    }

    if (hasStatus && status !== lead.status) {
      if (!STATUS_TRANSITIONS[lead.status].includes(status)) {
        return sendError(
          res,
          400,
          "INVALID_STATUS_TRANSITION",
          `Invalid status transition from ${lead.status} to ${status}`,
        );
      }

      lead.statusHistory.push({
        from: lead.status,
        to: status,
        changedBy: req.user,
      });

      lead.status = status;
    }

    if (hasFollowUpdate) {
      lead.followUpdate = followUpdate || undefined;
    }

    // Lost leads should never keep a follow-up date.
    if (lead.status === "Lost") {
      lead.followUpdate = undefined;
    }

    await lead.save();

    res.json({
      success: true,
      lead,
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return sendError(res, 404, "LEAD_NOT_FOUND", "Lead not found");
    }
    return sendError(res, 500, "SERVER_ERROR", "Server error");
  }
};

export const updateLeadFollowUp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, "VALIDATION_ERROR", "Validation failed", {
        errors: errors.array(),
      });
    }

    const { followUpdate } = req.body;

    if (followUpdate) {
      const parsedDate = new Date(followUpdate);
      if (Number.isNaN(parsedDate.getTime())) {
        return sendError(
          res,
          400,
          "INVALID_FOLLOW_UP_DATE",
          "Invalid followUpdate date",
        );
      }
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      createdBy: req.user,
    });

    if (!lead) {
      return sendError(res, 404, "LEAD_NOT_FOUND", "Lead not found");
    }

    if (lead.status === "Lost") {
      return sendError(
        res,
        400,
        "FOLLOW_UP_NOT_ALLOWED",
        "Follow-up is disabled for lost leads",
      );
    }

    lead.followUpdate = followUpdate || undefined;
    await lead.save();

    return res.json({
      success: true,
      lead,
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return sendError(res, 404, "LEAD_NOT_FOUND", "Lead not found");
    }

    return sendError(res, 500, "SERVER_ERROR", "Server error");
  }
};

export const getLeadStatusOptions = async (req, res) => {
  const { status } = req.params;

  if (!VALID_STATUSES.includes(status)) {
    return sendError(res, 400, "INVALID_STATUS", "Invalid current status");
  }

  res.set("Cache-Control", "public, max-age=300");

  return res.json({
    success: true,
    currentStatus: status,
    options: STATUS_TRANSITIONS[status],
  });
};

export const addNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return sendError(
        res,
        400,
        "NOTE_CONTENT_REQUIRED",
        "Note content is required",
      );
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      createdBy: req.user,
    });

    if (!lead) {
      return sendError(res, 404, "LEAD_NOT_FOUND", "Lead not found");
    }

    lead.notes.push({
      content,
      createdBy: req.user,
    });

    await lead.save();

    res.json({
      success: true,
      lead,
    });
  } catch {
    return sendError(res, 500, "SERVER_ERROR", "Server error");
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user,
    });

    if (!lead) {
      return sendError(res, 404, "LEAD_NOT_FOUND", "Lead not found");
    }

    res.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return sendError(res, 404, "LEAD_NOT_FOUND", "Lead not found");
    }
    return sendError(res, 500, "SERVER_ERROR", "Server error");
  }
};

export const getLeadAggregates = async (req, res) => {
  try {
    const [statusAgg, total, overdueFollowUps] = await Promise.all([
      Lead.aggregate([
        { $match: { createdBy: req.user } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Lead.countDocuments({ createdBy: req.user }),
      Lead.countDocuments({
        createdBy: req.user,
        followUpdate: { $lt: normalizeDateOnly(new Date()) },
      }),
    ]);

    const byStatus = VALID_STATUSES.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    statusAgg.forEach((entry) => {
      if (entry._id in byStatus) {
        byStatus[entry._id] = entry.count;
      }
    });

    return res.json({
      success: true,
      total,
      overdueFollowUps,
      byStatus,
    });
  } catch {
    return sendError(res, 500, "SERVER_ERROR", "Server error");
  }
};
