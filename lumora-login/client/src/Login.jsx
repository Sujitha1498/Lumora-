
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://lumora-api-3na9.onrender.com/api/login", 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim(),
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      navigate("/dashboard", {
        state: { user: data.user }
      });
    } catch {
      setError("Unable to connect. Please check the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lumora-login">
      <div className="login-grid-bg" />

      <header className="login-topbar">
        <a className="login-brand" href="/" aria-label="Lumora home">
          <span className="login-brand-icon">L</span>
          <span>lumora<span className="brand-dot">.</span></span>
          <span className="login-dev-tag">DEV</span>
        </a>

        <div className="login-top-note">
          <span className="online-dot" />
          YOUR SPACE TO BUILD
        </div>
      </header>

      <section className="login-layout">
        <div className="login-intro">
          <div className="login-eyebrow">
            <span className="intro-line" />
            YOUR NEXT CHAPTER STARTS HERE
          </div>

          <h1>
            Think it.
            <br />
            Build it.
            <br />
            <span>Ship it.</span>
          </h1>

          <p className="login-intro-text">
            Your ideas deserve more than a to-do list.
            Make progress, master your skills, and build
            something you're proud of.
          </p>

          <div className="login-feature-list">
            <div>
              <span className="feature-check">✓</span>
              <span>Track your coding goals</span>
            </div>
            <div>
              <span className="feature-check">✓</span>
              <span>Measure your developer progress</span>
            </div>
            <div>
              <span className="feature-check">✓</span>
              <span>Make every focus session count</span>
            </div>
          </div>

          <div className="login-code-card">
            <div className="code-window-top">
              <span className="window-dot dot-red" />
              <span className="window-dot dot-yellow" />
              <span className="window-dot dot-green" />
              <span className="code-filename">your-next-chapter.js</span>
            </div>

            <div className="code-lines">
              <p><span className="code-muted">01</span> <span className="code-purple">const</span> goal = <span className="code-green">"build something"</span>;</p>
              <p><span className="code-muted">02</span> <span className="code-purple">const</span> progress = <span className="code-cyan">keepGoing</span>();</p>
              <p><span className="code-muted">03</span> <span className="code-purple">return</span> <span className="code-green">success</span>;</p>
            </div>
          </div>
        </div>

        <div className="login-form-wrap">
          <div className="login-glow login-glow-one" />
          <div className="login-glow login-glow-two" />

          <div className="login-form-card">
            <div className="login-form-heading">
              <div className="login-avatar-icon">✳</div>
              <span className="login-form-kicker">WELCOME BACK</span>
              <h2>Sign in<span>.</span></h2>
              <p>Pick up where your ambition left off.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Email address</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">@</span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="login-password-heading">
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="login-show-button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="login-input-wrap">
                <span className="login-input-icon">⌑</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="login-error" role="alert">
                  <span>!</span> {error}
                </p>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Enter your workspace"}
                {!loading && <span>↗</span>}
              </button>
            </form>

            <div className="login-demo">
              <span className="demo-lock">◇</span>
              <div>
                <strong>Ready to explore?</strong>
                <p>demo@lumora.com / Lumora123</p>
              </div>
            </div>

            <div className="login-secure-note">
              <span>✦</span>
              Built for your next breakthrough
            </div>
          </div>
        </div>
      </section>

      <footer className="login-footer">
        <span>© {new Date().getFullYear()} Lumora</span>
        <span>DESIGNED FOR DEVELOPERS, BUILT FOR GROWTH</span>
      </footer>
    </main>
  );
}

export default Login;
