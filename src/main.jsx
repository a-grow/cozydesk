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
function AppGate() {
  const [needsOnboarding, setNeedsOnboarding] = useState(() => {
    try {
      return !hasAgreedToTerms();
    } catch (_) {
      return false;
    }
  });

  let existingUser = false;
  try {
    existingUser = hasExistingDeskData();
  } catch (_) {
    existingUser = false;
  }

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
