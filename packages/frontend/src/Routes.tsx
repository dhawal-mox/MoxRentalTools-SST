import { Route, Routes } from "react-router-dom";
import Home from "./containers/Home.tsx";
import NotFound from "./containers/NotFound.tsx";
import Login from "./containers/Authentication/Login.tsx";
import Signup from "./containers/Authentication/Signup.tsx";
import AuthenticatedRoute from "./components/AuthenticatedRoute.tsx";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute.tsx";
import SelectRole from "./containers/Onboarding/SelectRole.tsx";
import TenantFeatures from "./containers/Onboarding/tenant/TenantFeatures.tsx";
import ConfirmPayroll from "./containers/Onboarding/tenant/ConfirmPayroll.tsx";

export default function Links() {
  return (
    <Routes>
      <Route path="/" element={
        <AuthenticatedRoute>
          <Home />
        </AuthenticatedRoute>
      } />
      {/* Finally, catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />;
      <Route path="/login" element={
        <UnauthenticatedRoute>
          <Login />
        </UnauthenticatedRoute>
      } />
      <Route path="/signup" element={
        <UnauthenticatedRoute>
          <Signup />
        </UnauthenticatedRoute>
      } />
      <Route path="/selectRole" element={
        <AuthenticatedRoute>
          <SelectRole />
        </AuthenticatedRoute>
      } />
      <Route path="/tenantFeatures" element={
        <AuthenticatedRoute>
          <TenantFeatures />
        </AuthenticatedRoute>
      } />
      <Route path="/confirmPayroll" element={
        <AuthenticatedRoute>
          <ConfirmPayroll />
        </AuthenticatedRoute>
      } />
    </Routes>
  );
}