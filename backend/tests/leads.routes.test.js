import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../app.js";
import Lead from "../models/Lead.js";
import User from "../models/User.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const app = createApp({ disableRateLimit: true });

let mongoServer;

const buildAuthHeader = async () => {
  const user = await User.create({
    username: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@test.com`,
    password: "hashed-password",
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return {
    user,
    authorization: `Bearer ${token}`,
  };
};

const createLeadForUser = async (userId, overrides = {}) =>
  Lead.create({
    name: "Lead Example",
    email: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@test.com`,
    phone: "1234567890",
    source: "Website",
    status: "New",
    createdBy: userId,
    ...overrides,
  });

describe("lead routes", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    await Promise.all([Lead.deleteMany({}), User.deleteMany({})]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("returns paginated leads metadata", async () => {
    const { user, authorization } = await buildAuthHeader();

    const leads = await Promise.all(
      Array.from({ length: 12 }).map((_, index) =>
        createLeadForUser(user.id, {
          name: `Lead ${index}`,
          email: `lead${index}@test.com`,
          createdAt: new Date(Date.now() + index * 1000),
        }),
      ),
    );

    const response = await request(app)
      .get("/api/leads")
      .set("Authorization", authorization)
      .query({ page: 2, limit: 5, sort: "createdAt:desc" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.page).toBe(2);
    expect(response.body.limit).toBe(5);
    expect(response.body.total).toBe(12);
    expect(response.body.totalPages).toBe(3);
    expect(response.body.leads).toHaveLength(5);
    expect(response.body.leads[0].email).toBe(leads[6].email);
  });

  it("rejects invalid status filters with normalized errors", async () => {
    const { authorization } = await buildAuthHeader();

    const response = await request(app)
      .get("/api/leads")
      .set("Authorization", authorization)
      .query({ status: "InvalidStatus" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      code: "INVALID_STATUS",
      message: "Invalid status filter",
    });
  });

  it("rejects invalid status transitions", async () => {
    const { user, authorization } = await buildAuthHeader();
    const lead = await createLeadForUser(user.id, { status: "New" });

    const response = await request(app)
      .put(`/api/leads/${lead.id}`)
      .set("Authorization", authorization)
      .send({ status: "Converted" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      code: "INVALID_STATUS_TRANSITION",
    });
  });

  it("rejects follow-up updates for lost leads", async () => {
    const { user, authorization } = await buildAuthHeader();
    const lead = await createLeadForUser(user.id, { status: "Lost" });

    const response = await request(app)
      .patch(`/api/leads/${lead.id}/follow-up`)
      .set("Authorization", authorization)
      .send({ followUpdate: "2026-03-15" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      code: "FOLLOW_UP_NOT_ALLOWED",
    });
  });

  it("updates follow-up dates through the dedicated patch endpoint", async () => {
    const { user, authorization } = await buildAuthHeader();
    const lead = await createLeadForUser(user.id, { status: "Qualified" });

    const response = await request(app)
      .patch(`/api/leads/${lead.id}/follow-up`)
      .set("Authorization", authorization)
      .send({ followUpdate: "2026-03-20" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.lead.followUpdate).toContain("2026-03-20");

    const storedLead = await Lead.findById(lead.id).lean();
    expect(storedLead.followUpdate.toISOString()).toContain("2026-03-20");
  });
});
