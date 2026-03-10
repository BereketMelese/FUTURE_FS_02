import express from "express";
import { body } from "express-validator";
import auth from "../middleware/auth.js";
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  updateLeadFollowUp,
  getLeadStatusOptions,
  getLeadAggregates,
  addNote,
  deleteLead,
} from "../controllers/LeadControllers.js";

const router = express.Router();

const updateValidation = [
  body("status")
    .optional()
    .isIn(["New", "Contacted", "Qualified", "Converted", "Lost"])
    .withMessage("Invalid status value"),
  body("followUpdate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("followUpdate must be a valid ISO date"),
];

const followUpValidation = [
  body("followUpdate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("followUpdate must be a valid ISO date"),
];

const leadValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("source")
    .optional()
    .isIn(["Website", "Referral", "Social Media", "Email", "Other"])
    .withMessage("Invalid source value"),
  body("followUpdate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("followUpdate must be a valid ISO date"),
];

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Lead management endpoints
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Get all leads
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leads
 */

/**
 * @swagger
 * /api/leads/{id}:
 *   get:
 *     summary: Get a single lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead details
 */

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Create a new lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               source:
 *                 type: string
 *               followUpdate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Lead created
 */

/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: Update lead status
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [New, Contacted, Qualified, Converted, Lost]
 *               followUpdate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /api/leads/{id}/notes:
 *   post:
 *     summary: Add a note to a lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note added
 */

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary: Delete a lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead deleted
 */
router.use(auth);
router.get("/", getLeads);
router.get("/aggregates", getLeadAggregates);
router.get("/status-options/:status", getLeadStatusOptions);

router.get("/:id", getLead);
router.post("/", leadValidation, createLead);
router.put("/:id", updateValidation, updateLead);
router.patch("/:id/follow-up", followUpValidation, updateLeadFollowUp);
router.post("/:id/notes", addNote);
router.delete("/:id", deleteLead);

export default router;
