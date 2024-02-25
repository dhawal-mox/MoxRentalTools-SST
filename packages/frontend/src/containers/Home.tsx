import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "../components/LoginButton";
import "./Home.css";
import LogoutButton from "../components/LogoutButton";

export default function Home() {

    const { isAuthenticated } = useAuth0();

  return (
    <div className="Home">
      <div className="lander">
        <h1>MOX Rental Tools</h1>
        <p className="text-muted">Automatic income and emmployment verification.</p>
        <LoginButton />
        <LogoutButton />
      </div>
    </div>
  );
}