import { Route, Routes } from "react-router-dom";
import Home from "./containers/Home.tsx";
import NotFound from "./containers/NotFound.tsx";
import Login from "./containers/Authentication/Login.tsx";
import Signup from "./containers/Authentication/Signup.tsx";
import AuthenticatedRoute from "./components/AuthenticatedRoute.tsx";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute.tsx";

export default function Links() {
  return (
    <Routes>
      <Route path="/" element={
      <AuthenticatedRoute>
        <Home />
      </AuthenticatedRoute>} />
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
    </Routes>
  );
}