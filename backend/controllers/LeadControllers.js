import Lead from "../models/Lead.js";
import { validationResult } from "express-validator";

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
    const { name, email, phone, source } = req.body;
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
    const { status } = req.body;
    const validStatuses = [
      "New",
      "Contacted",
      "Qualified",
      "Converted",
      "Lost",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
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

    const validTransitions = {
      New: ["Contacted", "Qualified", "Lost"],
      Contacted: ["Qualified", "Lost"],
      Qualified: ["Lost", "Converted"],
      Converted: [],
      Lost: [],
    };

    if (!validTransitions[lead.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${lead.status} to ${status}`,
      });
    }

    lead.status = status;
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
