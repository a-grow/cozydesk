import React from "react";

// Catches unexpected errors anywhere in the app and shows a warm,
// reassuring card instead of a blank white screen. Crucially, it steers
// the user toward "Reload" and away from clearing browser data, which
// would erase their saved desks.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("CozyDesk caught an error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "24px",
            background: "linear-gradient(160deg, #f7efe4 0%, #efe6d8 100%)",
            fontFamily: "'Nunito', sans-serif",
            color: "#5a4a3a",
          }}
        >
          <div
            style={{
              maxWidth: "420px",
              background: "#fffdf8",
              borderRadius: "20px",
              padding: "32px 28px",
              boxShadow: "0 10px 40px rgba(90, 74, 58, 0.15)",
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "12px" }}>☕</div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 800,
                margin: "0 0 12px",
                color: "#5a4a3a",
              }}
            >
              Oops — something hiccuped
            </h1>
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.6,
                margin: "0 0 8px",
                color: "#7a6a5a",
              }}
            >
              CozyDesk ran into a little snag. Don't worry — your saved desks
              are safe. A quick reload usually sets things right.
            </p>
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.5,
                margin: "0 0 24px",
                color: "#a89a88",
              }}
            >
              (No need to clear your browser data — that would erase your desks.)
            </p>
            <button
              onClick={this.handleReload}
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: "16px",
                fontWeight: 700,
                color: "#fffdf8",
                background: "#c98a5e",
                border: "none",
                borderRadius: "12px",
                padding: "12px 28px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(201, 138, 94, 0.35)",
              }}
            >
              Reload CozyDesk
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
