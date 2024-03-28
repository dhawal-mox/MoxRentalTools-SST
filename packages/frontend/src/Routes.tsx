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
import StripePurchase from "./containers/Onboarding/StripePurchase.tsx";
import StripeIDVerification from "./containers/Onboarding/StripeIDVerification.tsx";
import PlaidPayrollLink from "./containers/Onboarding/tenant/PlaidPayrollLink.tsx";
import PlaidAuthLink from "./containers/Onboarding/tenant/PlaidAuthLink.tsx";
import TenantProfile from "./containers/TenantProfile/TenantProfile.tsx";
import ForgotPassword from "./containers/Authentication/ForgotPassword.tsx";
import TenantSetup from "./containers/Onboarding/tenant/TenantSetup.tsx";
import AgentSetup from "./containers/Onboarding/agent/AgentSetup.tsx";
import LicenseSubmit from "./containers/Onboarding/agent/LicenseSubmit.tsx";
import LandlordSetup from "./containers/Onboarding/landlord/LandlordSetup.tsx";
import ShareProfilePage from "./containers/ShareProfile.tsx";

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
      <Route path="/forgotPassword" element={
        <UnauthenticatedRoute>
          <ForgotPassword />
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
      <Route path="/purchase" element={
        <AuthenticatedRoute>
          <StripePurchase />
        </AuthenticatedRoute>
      } />
      <Route path="/idVerify" element={
        <AuthenticatedRoute>
          <StripeIDVerification />
        </AuthenticatedRoute>
      } />
      <Route path="/plaidPayroll" element={
        <AuthenticatedRoute>
          <PlaidPayrollLink />
        </AuthenticatedRoute>
      } />
      <Route path="/plaidAuth" element={
        <AuthenticatedRoute>
          <PlaidAuthLink />
        </AuthenticatedRoute>
      } />
      <Route path="/tenantSetup" element={
        <AuthenticatedRoute>
          <TenantSetup />
        </AuthenticatedRoute>
      } />
      <Route path="agentSetup" element={
        <AuthenticatedRoute>
          <AgentSetup />
        </AuthenticatedRoute>
      } />
      <Route path="licenseSubmit" element={
        <AuthenticatedRoute>
          <LicenseSubmit />
        </AuthenticatedRoute>
      }/>
      <Route path="landlordSetup" element={
        <AuthenticatedRoute>
          <LandlordSetup />
        </AuthenticatedRoute>
      } />
      <Route path="/tenantProfile" element={
        <AuthenticatedRoute>
          <TenantProfile />
        </AuthenticatedRoute>
      } />
      <Route path="/share" element={
        <AuthenticatedRoute>
          <ShareProfilePage />
        </AuthenticatedRoute>
      } />
    </Routes>
  );
}