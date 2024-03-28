import { useEffect, useState } from "react";
import { useAppContext } from "../lib/contextLib";
import { onboarding } from "../lib/onboardingLib";
import "./Home.css";
import { useLocation, useNavigate } from "react-router-dom";
import { getShareCodeForUserId } from "../lib/userLib";

export default function Home() {

  const { user, userOnboardingStatus } = useAppContext();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [ shareCode, setShareCode ] = useState<string>("");

  async function onLoad() {
    onboarding(nav, user, userOnboardingStatus, pathname);
    const result = await getShareCodeForUserId(user.userId!);
    setShareCode(result.shareCode!);
  }

  useEffect(() => {
    onLoad();
  }, []);

  return (
    <div className="Home">
      <div className="lander">
        <h1>MOX Rental Tools</h1>
        <p className="text-muted">Automatic income and emmployment verification for {user.first_name}.</p>
        <p>ShareCode: {shareCode}</p>
        {/* <LoginButton />
        <LogoutButton /> */}
      </div>
    </div>
  );
}