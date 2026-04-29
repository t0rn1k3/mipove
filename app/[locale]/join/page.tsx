"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/logo/Logo";
import styles from "./join.module.css";
import { useTranslations } from "next-intl";
import {
  registerUser,
  registerMaster,
  login,
  registerAdmin,
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
import { Link } from "@/i18n/navigation";

const USER_BENEFITS_KEYS = [
  "benefit1User", "benefit2User", "benefit3User", "benefit4User", "benefit5User",
];

const MASTER_BENEFITS_KEYS = [
  "benefit1Master", "benefit2Master", "benefit3Master", "benefit4Master", "benefit5Master",
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
  const t = useTranslations("join");
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
      setError(t("passwordsNoMatch"));
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
          setError(t("adminSecretRequired"));
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
      router.push(getAuthRedirectPath(json));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("registrationFailed"));
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
      router.push(getAuthRedirectPath(json));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const benefitKeys = role === "user" ? USER_BENEFITS_KEYS : MASTER_BENEFITS_KEYS;

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
          {t("title")}
        </h1>
      </section>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left Card - Role & Benefits */}
        <div
          className={`${styles.leftCard} ${styles.reveal} ${styles.revealDelay4}`}
        >
          {isAdminMode ? (
            <div>
              <h2 className={styles.sectionHeading}>{t("adminAccess")}</h2>
              <p className={styles.subtitle}>
                {activeTab === "login"
                  ? t("adminLoginDesc")
                  : t("adminRegisterDesc")}
              </p>
              <p className={styles.legalText}>
                {t("adminVisitUrl")}
              </p>
            </div>
          ) : (
            <>
              <div>
                <h2 className={styles.sectionHeading}>{t("chooseRole")}</h2>
                <div className={styles.roleOptions}>
                  <button
                    type="button"
                    className={`${styles.roleOption} ${role === "user" ? styles.selected : ""}`}
                    onClick={() => setRole("user")}
                  >
                    <User className={styles.roleIcon} />
                    <span className={styles.roleName}>{t("user")}</span>
                    <span className={styles.roleDesc}>
                      {t("userDesc")}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.roleOption} ${role === "master" ? styles.selected : ""}`}
                    onClick={() => setRole("master")}
                  >
                    <Briefcase className={styles.roleIcon} />
                    <span className={styles.roleName}>{t("professional")}</span>
                    <span className={styles.roleDesc}>
                      {t("professionalDesc")}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <h2 className={styles.sectionHeading}>
                  {role === "user" ? t("userBenefits") : t("masterBenefits")}
                </h2>
                <ul className={styles.benefitsList}>
                  {benefitKeys.map((key) => (
                    <li key={key} className={styles.benefitItem}>
                      <Check className={styles.benefitIcon} />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
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
              {isAdminMode ? t("registerAdmin") : t("register")}
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "login" ? styles.active : ""}`}
              onClick={() => handleTabSwitch("login")}
            >
              {t("login")}
            </button>
          </div>

          {activeTab === "register" ? (
            <form className={styles.form} onSubmit={handleRegisterSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.formLabel}>
                  {t("fullName")}
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
                    placeholder={t("fullNamePlaceholder")}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  {t("emailAddress")}
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
                    placeholder={t("emailPlaceholder")}
                    required
                  />
                </div>
              </div>

              {isAdminMode && (
                <div className={styles.formGroup}>
                  <label htmlFor="adminSecret" className={styles.formLabel}>
                    {t("adminSecret")}
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
                      placeholder={t("adminSecretPlaceholder")}
                      required={isAdminMode}
                    />
                  </div>
                </div>
              )}

              {!isAdminMode && (
                <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.formLabel}>
                  {t("phoneNumber")}
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
                      placeholder={t("phonePlaceholder")}
                      required
                    />
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  {t("password")}
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
                    placeholder={t("passwordPlaceholder")}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? t("hidePassword") : t("showPassword")
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
                  {t("confirmPassword")}
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
                    placeholder={t("confirmPasswordPlaceholder")}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? t("hidePassword") : t("showPassword")
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

              {error && <p className="mipoveGuestText mipoveGuestText--errorLight">{error}</p>}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                <span className={styles.submitBtnContent}>
                  {loading && <span className={styles.spinner} aria-hidden />}
                  {loading ? t("creatingAccount") : t("createAccount")}
                </span>
              </button>

              {/* {!isAdminMode && (
                <p className={styles.legalText}>
                  {t("termsPrefix")}{" "}
                  <Link href="/terms" className={styles.legalLink}>
                    {t("termsOfService")}
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className={styles.legalLink}>
                    {t("privacyPolicy")}
                  </Link>
                  .
                </p>
              )} */}
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
                    placeholder={t("emailPlaceholder")}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="loginPassword" className={styles.formLabel}>
                  {t("password")}
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
                    placeholder={t("loginPasswordPlaceholder")}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? t("hidePassword") : t("showPassword")
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && <p className="mipoveGuestText mipoveGuestText--errorLight">{error}</p>}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                <span className={styles.submitBtnContent}>
                  {loading && <span className={styles.spinner} aria-hidden />}
                  {loading ? t("loggingIn") : t("login")}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
