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

export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ createdBy: req.user }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("❌ Error fetching leads:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      createdBy: req.user,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }
    res.json({
      success: true,
      lead,
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const createLead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
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
      return res.status(400).json({
        success: false,
        message: "Lead with this email already exists",
      });
    }

    const newLead = new Lead({
      name,
      email,
      phone,
      source,
      followUpdate,
      createdBy: req.user,
    });

    const lead = await newLead.save();

    res.status(201).json({
      success: true,
      lead,
    });
  } catch (err) {
    console.error("❌ Error creating lead:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { status, followUpdate } = req.body;

    const hasStatus = typeof status === "string";
    const hasFollowUpdate = Object.prototype.hasOwnProperty.call(
      req.body,
      "followUpdate",
    );

    if (!hasStatus && !hasFollowUpdate) {
      return res.status(400).json({
        success: false,
        message: "Provide status and/or followUpdate to update lead",
      });
    }

    if (hasStatus && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    if (hasFollowUpdate && followUpdate) {
      const parsedDate = new Date(followUpdate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid followUpdate date",
        });
      }
    }

    let lead = await Lead.findOne({
      _id: req.params.id,
      createdBy: req.user,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (lead.status === "Lost" && hasStatus) {
      return res.status(400).json({
        success: false,
        message: "Lost leads cannot have status updates",
      });
    }

    const targetStatus = hasStatus ? status : lead.status;

    if (targetStatus === "Lost" && hasFollowUpdate && followUpdate) {
      return res.status(400).json({
        success: false,
        message: "Lost leads cannot have a follow-up date",
      });
    }

    if (hasStatus && status !== lead.status) {
      if (!STATUS_TRANSITIONS[lead.status].includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from ${lead.status} to ${status}`,
        });
      }

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
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getLeadStatusOptions = async (req, res) => {
  const { status } = req.params;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid current status",
    });
  }

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
      return res.status(400).json({
        success: false,
        message: "Note content is required",
      });
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      createdBy: req.user,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
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
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
