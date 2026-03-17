"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/logo/Logo";
import styles from "./join.module.css";
import {
  registerUser,
  registerMaster,
  login,
  registerAdmin,
  storeToken,
  getAuthRedirectPath,
} from "@/lib/api";
import {
  User,
  Briefcase,
  Check,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

const USER_BENEFITS = [
  "Access to verified masters",
  "Browse portfolios and reviews",
  "Direct messaging with artisans",
  "Save your favorite masters",
  "Track your project inquiries",
];

const MASTER_BENEFITS = [
  "Showcase your portfolio to clients",
  "Receive direct project inquiries",
  "Build your reputation as a master",
  "Connect with clients seeking your craft",
  "Manage projects and communications",
];

const initialRegisterForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  adminSecret: "",
};

const initialLoginForm = {
  email: "",
  password: "",
};

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminMode = searchParams.get("admin") === "1";
  const [activeTab, setActiveTab] = useState<"register" | "login">(
    isAdminMode ? "login" : "register"
  );
  const [role, setRole] = useState<"user" | "master">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);

  useEffect(() => {
    if (isAdminMode) setActiveTab("login");
  }, [isAdminMode]);

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTabSwitch = (tab: "register" | "login") => {
    setActiveTab(tab);
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (tab === "login") {
      setRegisterForm(initialRegisterForm);
    } else {
      setLoginForm(initialLoginForm);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = {
        name: registerForm.fullName,
        email: registerForm.email,
        phone: registerForm.phone || undefined,
        password: registerForm.password,
      };
      let json: Awaited<ReturnType<typeof registerUser>>;
      if (isAdminMode) {
        if (!registerForm.adminSecret) {
          setError("Admin secret is required");
          setLoading(false);
          return;
        }
        json = await registerAdmin({
          name: registerForm.fullName,
          email: registerForm.email,
          password: registerForm.password,
          adminSecret: registerForm.adminSecret,
        });
      } else {
        json =
          role === "master"
            ? await registerMaster(data)
            : await registerUser(data);
      }
      storeToken(json.token);
      router.push(getAuthRedirectPath(json));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const json = await login({
        email: loginForm.email,
        password: loginForm.password,
      });
      storeToken(json.token);
      router.push(getAuthRedirectPath(json));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const benefits = role === "user" ? USER_BENEFITS : MASTER_BENEFITS;

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div
          className={`${styles.heroLogo} ${styles.reveal} ${styles.revealDelay1}`}
        >
          <Logo showText size={48} />
        </div>
        <h1
          className={`${styles.title} ${styles.reveal} ${styles.revealDelay2}`}
        >
          Join Mipove
        </h1>
        <p
          className={`${styles.subtitle} ${styles.reveal} ${styles.revealDelay3}`}
        >
          Create your account and start connecting
        </p>
      </section>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left Card - Role & Benefits (hidden in admin mode) */}
        <div
          className={`${styles.leftCard} ${styles.reveal} ${styles.revealDelay4}`}
        >
          {isAdminMode ? (
            <div>
              <h2 className={styles.sectionHeading}>Admin Access</h2>
              <p className={styles.subtitle}>
                {activeTab === "login"
                  ? "Log in to access the admin dashboard."
                  : "Create an admin account. Requires ADMIN_SECRET to be configured."}
              </p>
              <p className={styles.legalText}>
                Visit <strong>/join?admin=1</strong> to access this flow.
              </p>
            </div>
          ) : (
            <>
              <div>
                <h2 className={styles.sectionHeading}>Choose Your Role</h2>
                <div className={styles.roleOptions}>
                  <button
                    type="button"
                    className={`${styles.roleOption} ${role === "user" ? styles.selected : ""}`}
                    onClick={() => setRole("user")}
                  >
                    <User className={styles.roleIcon} />
                    <span className={styles.roleName}>User</span>
                    <span className={styles.roleDesc}>
                      Find masters for your projects
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.roleOption} ${role === "master" ? styles.selected : ""}`}
                    onClick={() => setRole("master")}
                  >
                    <Briefcase className={styles.roleIcon} />
                    <span className={styles.roleName}>Professional</span>
                    <span className={styles.roleDesc}>
                      Showcase your work and connect with clients
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <h2 className={styles.sectionHeading}>
                  {role === "user" ? "User" : "Master"} Benefits
                </h2>
                <ul className={styles.benefitsList}>
                  {benefits.map((benefit) => (
                    <li key={benefit} className={styles.benefitItem}>
                      <Check className={styles.benefitIcon} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.trustedCallout}>
                <p className={styles.trustedText}>Trusted by 500+ masters</p>
                <p className={styles.communityText}>
                  Join our growing community today
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right Card - Form */}
        <div
          className={`${styles.rightCard} ${styles.reveal} ${styles.revealDelay5}`}
        >
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "register" ? styles.active : ""}`}
              onClick={() => handleTabSwitch("register")}
            >
              {isAdminMode ? "Register Admin" : "Register"}
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "login" ? styles.active : ""}`}
              onClick={() => handleTabSwitch("login")}
            >
              Login
            </button>
          </div>

          {activeTab === "register" ? (
            <form className={styles.form} onSubmit={handleRegisterSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.formLabel}>
                  Full Name *
                </label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={registerForm.fullName}
                    onChange={handleRegisterChange}
                    className={styles.formInput}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  Email Address *
                </label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    className={styles.formInput}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {isAdminMode && (
                <div className={styles.formGroup}>
                  <label htmlFor="adminSecret" className={styles.formLabel}>
                    Admin Secret *
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} />
                    <input
                      id="adminSecret"
                      name="adminSecret"
                      type="password"
                      value={registerForm.adminSecret}
                      onChange={handleRegisterChange}
                      className={styles.formInput}
                      placeholder="Enter admin secret"
                      required={isAdminMode}
                    />
                  </div>
                </div>
              )}

              {!isAdminMode && (
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.formLabel}>
                    Phone Number *
                  </label>
                  <div className={styles.inputWrapper}>
                    <Phone className={styles.inputIcon} />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={registerForm.phone}
                      onChange={handleRegisterChange}
                      className={styles.formInput}
                      placeholder="+995 XXX XXX XXX"
                      required
                    />
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  Password *
                </label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    className={styles.formInput}
                    placeholder="Minimum 8 characters"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className={styles.inputIcon} />
                    ) : (
                      <Eye className={styles.inputIcon} />
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  Confirm Password *
                </label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    className={styles.formInput}
                    placeholder="Re-enter your password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className={styles.errorMessage}>{error}</p>}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                <span className={styles.submitBtnContent}>
                  {loading && <span className={styles.spinner} aria-hidden />}
                  {loading ? "Creating account..." : "Create Account"}
                </span>
              </button>

              {!isAdminMode && (
                <p className={styles.legalText}>
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className={styles.legalLink}>
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className={styles.legalLink}>
                    Privacy Policy
                  </Link>
                  .
                </p>
              )}
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleLoginSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="loginEmail" className={styles.formLabel}>
                  Email Address *
                </label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} />
                  <input
                    id="loginEmail"
                    name="email"
                    type="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    className={styles.formInput}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="loginPassword" className={styles.formLabel}>
                  Password *
                </label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} />
                  <input
                    id="loginPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    className={styles.formInput}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && <p className={styles.errorMessage}>{error}</p>}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                <span className={styles.submitBtnContent}>
                  {loading && <span className={styles.spinner} aria-hidden />}
                  {loading ? "Logging in..." : "Login"}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
