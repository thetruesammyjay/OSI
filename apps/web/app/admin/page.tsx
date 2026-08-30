"use client";

import { type FormEvent, useState } from "react";
import { ArrowRight01Icon, LockIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { api } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter(); const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(null); const form = new FormData(event.currentTarget); try { await api.login(String(form.get("username") ?? ""), String(form.get("password") ?? "")); router.push("/admin/dashboard"); } catch (reason) { setError(reason instanceof Error ? reason.message : "Sign in failed."); } finally { setBusy(false); } }
  return <main className="page"><div className="auth-wrap"><aside className="auth-aside"><div><p className="eyebrow">Content desk</p><h1 style={{ color: "#fff", fontSize: "clamp(2.4rem, 5vw, 4rem)", marginTop: 18 }}>Keep the lesson accurate.</h1></div><p>The admin workspace manages the FAQs and assessment bank that support the academic simulation.</p></aside><div className="auth-form"><div className="section-heading"><span className="icon-wrap" style={{ background: "var(--hi-yellow)", borderRadius: "50%", display: "inline-flex", height: 44, width: 44, alignItems: "center", justifyContent: "center" }}><Icon icon={LockIcon} size={22} /></span><p className="eyebrow">Admin sign in</p><h2>Welcome back.</h2><p className="muted">Your session is secured with an HttpOnly cookie.</p></div><form className="form-grid" onSubmit={submit}><div className="field"><label htmlFor="username">Username</label><input id="username" name="username" autoComplete="username" required /></div><div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>{error ? <p className="form-message error" role="alert">{error}</p> : null}<button className="button button-dark" disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in"} <Icon icon={ArrowRight01Icon} size={17} /></button></form></div></div></main>;
}
