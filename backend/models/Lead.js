import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Note content is required"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Note creator is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Lead name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Lead email is required"],
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
  },
  phone: {
    type: String,
    trim: true,
  },
  source: {
    type: String,
    enum: {
      values: ["Website", "Referral", "Social Media", "Email", "Other"],
      message: "{VALUE} is not a valid lead source",
    },
    default: "Other",
  },
  status: {
    type: String,
    enum: {
      values: ["New", "Contacted", "Qualified", "Converted", "Lost"],
      message: "{VALUE} is not a valid lead status",
    },
    default: "New",
  },
  notes: [NoteSchema],
  followUpdate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Lead creator is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Lead = mongoose.model("Lead", LeadSchema);

export default Lead;
