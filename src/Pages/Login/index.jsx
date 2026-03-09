import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import css from "./style.module.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../App/Hooks/useAuth";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [waiting, setWaiting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        kode: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setWaiting(true);
        setError("");
        try {
            const result = await login(formData.kode, formData.password);
            if (result.success) {
                navigate("/");
            } else {
                setError(result.message || "Нэвтрэхэд алдаа гарлаа");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.");
        } finally {
            setWaiting(false);
        }
    };

    return (
        <div className={css.loginWrapper}>
            <div className={css.loginContainer}>
                <div className={css.imageSection}>
                    <div className={css.overlay} />
                    <div className={css.pattern} />
                    <div className={css.imageContent}>
                        <div className={css.logoBadge}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                            </svg>
                        </div>
                        <h1 className={css.welcomeTitle}>ОБЕГ</h1>
                        <p className={css.welcomeText}>
                            Аюулгүй, найдвартай системд тавтай морил.
                            Таны нэвтрэлт хамгаалагдсан байна.
                        </p>
                        <div className={css.features}>
                            <div className={css.featureItem}>
                                <div className={css.checkIcon}>✓</div>
                                <span>Аюулгүй нэвтрэлт</span>
                            </div>
                            <div className={css.featureItem}>
                                <div className={css.checkIcon}>✓</div>
                                <span>24/7 Техник дэмжлэг</span>
                            </div>
                            <div className={css.featureItem}>
                                <div className={css.checkIcon}>✓</div>
                                <span>Хурдан үйлчилгээ</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Form section ── */}
                <div className={css.formSection}>
                    <div className={css.formWrapper}>

                        <div className={css.formHeader}>
                            <h2 className={css.formTitle}>Нэвтрэх</h2>
                            <p className={css.formSubtitle}>
                                Өөрийн код болон нууц үгээ оруулна уу
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className={css.form}>

                            {/* Error */}
                            {error && (
                                <div className={css.errorBox}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* Код */}
                            <div className={css.inputGroup}>
                                <label htmlFor="kode" className={css.label}>Код</label>
                                <div className={css.inputWrapper}>
                                    <svg className={css.inputIcon} viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <input
                                        type="text"
                                        id="kode"
                                        name="kode"
                                        className={css.input}
                                        placeholder="Кодоо оруулна уу"
                                        value={formData.kode}
                                        onChange={handleChange}
                                        disabled={waiting}
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            {/* Нууц үг */}
                            <div className={css.inputGroup}>
                                <label htmlFor="password" className={css.label}>Нууц үг</label>
                                <div className={css.inputWrapper}>
                                    <svg className={css.inputIcon} viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        className={css.input}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={waiting}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className={css.toggleBtn}
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={waiting}
                                    >
                                        {showPassword ? (
                                            <svg viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Нууц үг мартсан */}
                            <div className={css.formOptions}>
                                <a href="#" className={css.forgotLink}>
                                    Нууц үг мартсан уу?
                                </a>
                            </div>

                            {/* Submit */}
                            <button type="submit" className={css.submitBtn} disabled={waiting}>
                                {waiting ? (
                                    <>
                                        <svg className={css.spinner} viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                        </svg>
                                        <span>Уншиж байна...</span>
                                    </>
                                ) : (
                                    <>
                                        <span style={{color:"white"}}>Нэвтрэх</span>
                                        <svg viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2.5">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className={css.divider}>
                            <span>эсвэл</span>
                        </div>

                        {/* Alt actions */}
                        <div className={css.altActions}>
                            <button className={css.altBtn} disabled={waiting}>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                </svg>
                                Тусламж
                            </button>
                            <Link
                                to="/register"
                                className={`${css.altBtn} ${waiting ? css.disabled : ""}`}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                </svg>
                                Бүртгүүлэх
                            </Link>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;