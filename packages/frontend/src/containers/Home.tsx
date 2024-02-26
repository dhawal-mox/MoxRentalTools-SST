import { useAppContext } from "../lib/contextLib";
import "./Home.css";

export default function Home() {

  const { user } = useAppContext();

  return (
    <div className="Home">
      <div className="lander">
        <h1>MOX Rental Tools</h1>
        <p className="text-muted">Automatic income and emmployment verification for {user.first_name}.</p>
        {/* <LoginButton />
        <LogoutButton /> */}
      </div>
    </div>
  );
}