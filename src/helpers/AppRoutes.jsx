import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";

import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import Layout from "../components/Layout/Layout";

import Dashboard from "../pages/Dashboard";
import Leads from "../pages/Leads";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Layout */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
      </Route>
    </Routes>
  );
}
