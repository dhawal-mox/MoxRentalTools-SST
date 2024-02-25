import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { Auth0Provider } from "@auth0/auth0-react";
import { getConfig } from "./config";
import App from './App.tsx'
import "bootstrap/dist/css/bootstrap.min.css"
import './index.css'

const config = getConfig();

const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  redirectUri: window.location.origin,
  // onRedirectCallback,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Auth0Provider {...providerConfig}>
    <React.StrictMode>
      <Router>
        <App />
      </Router>
  </React.StrictMode>
  </Auth0Provider>
)
