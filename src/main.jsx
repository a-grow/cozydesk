import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./themes/ThemeContext.jsx";
import Cozykawaii from "./themes/cozykawaii.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import OnboardingFlow from "./components/OnboardingFlow.jsx";
import { hasAgreedToTerms, hasExistingDeskData } from "./utils/onboardingState.js";
import './index.css';

// Gatekeeper: decides whether to show onboarding or the desk on launch.
// Wrapped defensively — if the check ever throws, we fall through to the desk.
// Captured ONCE at module load — before any component mounts or autosaves.
// If we read this during AppGate's render instead, the desk's first autosave
// can write a cozydesk_state_ key before the read, making a true first-timer
// look like an existing user (skips splash + pick-your-world). Freeze it here.
const INITIAL_EXISTING_USER = (() => {
  try {
    return hasExistingDeskData();
  } catch (_) {
    return false;
  }
})();

function AppGate() {
  const [needsOnboarding, setNeedsOnboarding] = useState(() => {
    try {
      return !hasAgreedToTerms();
    } catch (_) {
      return false;
    }
  });

  const existingUser = INITIAL_EXISTING_USER;

  if (needsOnboarding) {
    return (
      <OnboardingFlow
        isExistingUser={existingUser}
        onFinish={() => setNeedsOnboarding(false)}
      />
    );
  }

  return <Cozykawaii />;
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AppGate />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
