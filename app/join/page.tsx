"use client";

import { useState } from "react";
import Logo from "@/components/logo/Logo";
import styles from "./join.module.css";
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
  "Access to verified professionals",
  "Browse portfolios and reviews",
  "Direct messaging with artisans",
  "Save your favorite professionals",
  "Track your project inquiries",
];

const PROFESSIONAL_BENEFITS = [
  "Showcase your portfolio to clients",
  "Receive direct project inquiries",
  "Build your professional reputation",
  "Connect with clients seeking your craft",
  "Manage projects and communications",
];

export default function JoinPage() {
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");
  const [role, setRole] = useState<"user" | "professional">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const benefits =
    role === "user" ? USER_BENEFITS : PROFESSIONAL_BENEFITS;

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`${styles.heroLogo} ${styles.reveal} ${styles.revealDelay1}`}>
          <Logo showText size={48} />
        </div>
        <h1 className={`${styles.title} ${styles.reveal} ${styles.revealDelay2}`}>
          Join Mipove
        </h1>
        <p className={`${styles.subtitle} ${styles.reveal} ${styles.revealDelay3}`}>
          Create your account and start connecting
        </p>
      </section>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left Card - Role & Benefits */}
        <div className={`${styles.leftCard} ${styles.reveal} ${styles.revealDelay4}`}>
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
                  Find professionals for your projects
                </span>
              </button>
              <button
                type="button"
                className={`${styles.roleOption} ${role === "professional" ? styles.selected : ""}`}
                onClick={() => setRole("professional")}
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
              {role === "user" ? "User" : "Professional"} Benefits
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
            <p className={styles.trustedText}>
              Trusted by 500+ professionals
            </p>
            <p className={styles.communityText}>
              Join our growing community today
            </p>
          </div>
        </div>

        {/* Right Card - Form */}
        <div className={`${styles.rightCard} ${styles.reveal} ${styles.revealDelay5}`}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "register" ? styles.active : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "login" ? styles.active : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
          </div>

          {activeTab === "register" ? (
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.formLabel}>
                  Full Name *
                </label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} />
                  <input
                    id="fullName"
                    type="text"
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
                    type="email"
                    className={styles.formInput}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.formLabel}>
                  Phone Number *
                </label>
                <div className={styles.inputWrapper}>
                  <Phone className={styles.inputIcon} />
                  <input
                    id="phone"
                    type="tel"
                    className={styles.formInput}
                    placeholder="+995 XXX XXX XXX"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  Password *
                </label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={styles.formInput}
                    placeholder="Minimum 8 characters"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
                    type={showConfirmPassword ? "text" : "password"}
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

              <button type="submit" className={styles.submitBtn}>
                Create Account
              </button>

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
            </form>
          ) : (
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="loginEmail" className={styles.formLabel}>
                  Email Address *
                </label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} />
                  <input
                    id="loginEmail"
                    type="email"
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
                    type={showPassword ? "text" : "password"}
                    className={styles.formInput}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Login
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
