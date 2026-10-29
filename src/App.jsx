
import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

const crops = ["Banana", "Coconut"];

const labels = {
  en: {
    dashboard: "Overview",
    diagnosis: "Crop diagnosis",
    market: "Market trends",
    profile: "Farmer profile",
    welcome: "Your farm, better informed.",
    subtitle: "Crop health and market insights in one place.",
    diagnose: "Diagnose a crop",
    prices: "Explore market trends",
    chooseCrop: "Choose your crop",
    takePhoto: "Take a photo",
    gallery: "Choose from gallery",
    analyze: "Analyze image",
    noModel: "AI model not connected yet",
    noModelText:
      "Your photo is ready. Connect the trained crop model to obtain a genuine disease prediction.",
    recommendation: "Diagnosis & recommendations",
    recommendationText:
      "Disease-specific treatment guidance will appear here after a supported diagnosis. Do not apply chemicals based on an unverified result.",
    marketText:
      "Market price data is not connected yet. Connect a verified source such as AGMARKNET before displaying prices or trends.",
    profileText: "Update your farmer information.",
    name: "Full name",
    phone: "Phone",
    district: "District",
    village: "Village / town",
    land: "Land size (acres)",
    ownership: "Land ownership",
    owned: "Owned",
    leased: "Leased",
    other: "Other",
    save: "Save profile",
    saved: "Profile saved.",
    logout: "Sign out",
    login: "Sign in",
    signup: "Create account",
    email: "Email",
    password: "Password",
    switchSignup: "New here? Create an account",
    switchLogin: "Already registered? Sign in",
    language: "தமிழ்",
    loading: "Please wait...",
    error: "Something went wrong.",
    selectPhoto: "Select a crop photo to get started.",
    signInHeading: "Welcome to AGRISENSE",
    signInText: "Crop health and farmer support, designed for you.",
    confirm: "Check your email to confirm your account, then sign in.",
    schemes: "Farmer support",
    schemesText: "Your profile will help prepare for relevant scheme matching.",
    recovery: "Recovery tracking",
    recoveryText: "Follow-up photo tracking will be added after diagnosis.",
    back: "Back",
    cameraHint: "Use a clear, well-lit photo of the affected leaf or plant.",
  },
  ta: {
    dashboard: "முகப்பு",
    diagnosis: "பயிர் நோய் கண்டறிதல்",
    market: "சந்தை போக்குகள்",
    profile: "விவசாயி விவரங்கள்",
    welcome: "உங்கள் பண்ணை, சிறந்த தகவல்களுடன்.",
    subtitle: "பயிர் ஆரோக்கியம் மற்றும் சந்தைத் தகவல்கள் ஒரே இடத்தில்.",
    diagnose: "பயிரைச் சோதிக்கவும்",
    prices: "சந்தை போக்குகளைப் பார்க்கவும்",
    chooseCrop: "பயிரைத் தேர்வு செய்யவும்",
    takePhoto: "புகைப்படம் எடுக்கவும்",
    gallery: "புகைப்படத்தைத் தேர்வு செய்யவும்",
    analyze: "படத்தைப் பகுப்பாய்வு செய்",
    noModel: "AI மாதிரி இன்னும் இணைக்கப்படவில்லை",
    noModelText:
      "உங்கள் புகைப்படம் தயாராக உள்ளது. உண்மையான நோய் கணிப்புக்கு பயிற்சியளிக்கப்பட்ட மாதிரியை இணைக்க வேண்டும்.",
    recommendation: "நோய் விளக்கம் மற்றும் பரிந்துரைகள்",
    recommendationText:
      "உறுதிப்படுத்தப்பட்ட நோய் கண்டறிதலுக்குப் பிறகு சிகிச்சை வழிகாட்டுதல் வழங்கப்படும். உறுதிப்படுத்தப்படாத முடிவின் அடிப்படையில் மருந்துகளைப் பயன்படுத்த வேண்டாம்.",
    marketText:
      "சந்தை விலைத் தரவு இன்னும் இணைக்கப்படவில்லை. விலை மற்றும் போக்குகளைக் காட்ட AGMARKNET போன்ற நம்பகமான ஆதாரத்தை இணைக்க வேண்டும்.",
    profileText: "உங்கள் விவசாயி விவரங்களைப் புதுப்பிக்கவும்.",
    name: "முழுப் பெயர்",
    phone: "தொலைபேசி",
    district: "மாவட்டம்",
    village: "கிராமம் / நகரம்",
    land: "நில அளவு (ஏக்கர்)",
    ownership: "நில உரிமை",
    owned: "சொந்த நிலம்",
    leased: "குத்தகை",
    other: "மற்றவை",
    save: "சேமிக்கவும்",
    saved: "விவரங்கள் சேமிக்கப்பட்டன.",
    logout: "வெளியேறு",
    login: "உள்நுழைக",
    signup: "கணக்கை உருவாக்கு",
    email: "மின்னஞ்சல்",
    password: "கடவுச்சொல்",
    switchSignup: "புதிய பயனரா? கணக்கை உருவாக்கவும்",
    switchLogin: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக",
    language: "English",
    loading: "தயவுசெய்து காத்திருக்கவும்...",
    error: "பிழை ஏற்பட்டது.",
    selectPhoto: "தொடங்க பயிரின் புகைப்படத்தைத் தேர்ந்தெடுக்கவும்.",
    signInHeading: "AGRISENSE-க்கு வரவேற்கிறோம்",
    signInText: "உங்களுக்கான பயிர் ஆரோக்கியம் மற்றும் விவசாயி ஆதரவு.",
    confirm: "மின்னஞ்சலை உறுதிப்படுத்தி உள்நுழையவும்.",
    schemes: "விவசாயி ஆதரவு",
    schemesText: "திட்டப் பொருத்தத்தை உருவாக்க உங்கள் விவரங்கள் உதவும்.",
    recovery: "மீட்பு கண்காணிப்பு",
    recoveryText: "நோய் கண்டறிதலுக்குப் பிறகு புகைப்படக் கண்காணிப்பு சேர்க்கப்படும்.",
    back: "திரும்பு",
    cameraHint: "பாதிக்கப்பட்ட இலையை அல்லது செடியைத் தெளிவாகப் புகைப்படம் எடுக்கவும்.",
  },
};

const emptyProfile = {
  full_name: "",
  phone: "",
  district: "",
  village: "",
  crops: [],
  land_size_acres: "",
  land_ownership: "",
  preferred_language: "en",
};

function App() {
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("login");
  const [page, setPage] = useState("dashboard");
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [profile, setProfile] = useState(emptyProfile);
  const [crop, setCrop] = useState("Banana");
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [isError, setIsError] = useState(false);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const t = labels[language];

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    async function loadProfile() {
      const { data, error } = await supabase
        .from("farmer_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      if (data) {
        setProfile({ ...emptyProfile, ...data, crops: data.crops ?? [] });
      } else if (!error) {
        setProfile({
          ...emptyProfile,
          full_name: user.user_metadata?.full_name ?? "",
          phone: user.user_metadata?.phone ?? "",
          preferred_language: language,
        });
      } else {
        setMessage(error.message);
        setIsError(true);
      }
    }
    loadProfile();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    return () => {
      if (photo?.url) URL.revokeObjectURL(photo.url);
    };
  }, [photo]);

  function setField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function setProfileField(event) {
    setProfile({ ...profile, [event.target.name]: event.target.value });
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      setIsError(true);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Please choose an image smaller than 10 MB.");
      setIsError(true);
      return;
    }
    setPhoto({ file, url: URL.createObjectURL(file) });
    setMessage("");
    setIsError(false);
  }

  async function authenticate(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: form.full_name.trim(), preferred_language: language },
          },
        });
        if (error) throw error;
        if (data.session) {
          setUser(data.user);
        } else {
          setMode("login");
          setMessage(t.confirm);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(error.message || t.error);
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const payload = {
      id: user.id,
      full_name: profile.full_name.trim(),
      phone: profile.phone || null,
      preferred_language: language,
      state: "Tamil Nadu",
      district: profile.district || null,
      village: profile.village || null,
      crops: profile.crops || [],
      land_size_acres: profile.land_size_acres === "" ? null : Number(profile.land_size_acres),
      land_ownership: profile.land_ownership || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("farmer_profiles").upsert(payload);
    setBusy(false);
    setMessage(error ? error.message : t.saved);
    setIsError(Boolean(error));
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(error.message);
      setIsError(true);
    } else {
      setUser(null);
      setPage("dashboard");
      setPhoto(null);
      setMessage("");
    }
  }

  if (loading) return <div className="loading-screen">{t.loading}</div>;

  if (!user) {
    return (
      <main className="auth-screen">
        <section className="auth-story">
          <div className="brand"><span className="brand-icon">A</span> AGRISENSE</div>
          <span className="eyebrow">CROP HEALTH · FARMER WELFARE</span>
          <h1>{t.signInHeading}</h1>
          <p>{t.signInText}</p>
          <div className="story-tags"><span>01 · Crop health</span><span>02 · Market insights</span><span>03 · Farmer support</span></div>
        </section>
        <section className="auth-panel">
          <div className="language-switch">
            <button onClick={() => setLanguage(language === "en" ? "ta" : "en")}>{t.language}</button>
          </div>
          <h2>{mode === "login" ? t.login : t.signup}</h2>
          <p className="muted">{t.signInText}</p>
          <form onSubmit={authenticate} className="form-stack">
            {mode === "signup" && <label>{t.name}<input name="full_name" value={form.full_name} onChange={setField} required maxLength={100} /></label>}
            <label>{t.email}<input name="email" type="email" value={form.email} onChange={setField} required autoComplete="email" /></label>
            <label>{t.password}<input name="password" type="password" value={form.password} onChange={setField} required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
            {message && <p className={isError ? "alert error" : "alert"}>{message}</p>}
            <button className="primary-button full-width" disabled={busy}>{busy ? t.loading : mode === "login" ? t.login : t.signup}</button>
          </form>
          <button className="text-button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? t.switchSignup : t.switchLogin}</button>
        </section>
      </main>
    );
  }

  const navItems = [
    { id: "dashboard", icon: "⌂", label: t.dashboard },
    { id: "diagnosis", icon: "⌕", label: t.diagnosis },
    { id: "market", icon: "↗", label: t.market },
    { id: "profile", icon: "○", label: t.profile },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top"><span className="brand-icon">A</span> AGRISENSE</a>
        <div className="side-caption">FARMER WORKSPACE</div>
        <nav>
          {navItems.map((item) => (
            <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { setPage(item.id); setMessage(""); }}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="avatar">{(profile.full_name || user.email || "F").slice(0, 1).toUpperCase()}</span>
          <div className="user-mini"><strong>{profile.full_name || user.email}</strong><small>Farmer account</small></div>
          <button className="logout-button" onClick={logout} aria-label={t.logout}>↪</button>
        </div>
      </aside>

      <main className="main-panel" id="top">
        <header className="page-topbar">
          <div><span className="eyebrow">AGRISENSE / FARMER WORKSPACE</span><p>Practical insights for your farm</p></div>
          <button className="language-pill" onClick={() => setLanguage(language === "en" ? "ta" : "en")}>{language === "en" ? "தமிழ்" : "English"}</button>
        </header>

        {page === "dashboard" && (
          <section className="page-content">
            <div className="welcome-banner">
              <div><span className="eyebrow light">YOUR FARM · YOUR DECISIONS</span><h1>{t.welcome}</h1><p>{t.subtitle}</p><button className="gold-button" onClick={() => setPage("diagnosis")}>{t.diagnose} <span>→</span></button></div>
              <div className="banner-illustration" aria-hidden="true"><span>✳</span><div>🌿</div></div>
            </div>
            <div className="section-heading"><div><h2>Farm tools</h2><p>Choose a service to continue.</p></div></div>
            <div className="tool-grid">
              <button className="tool-card" onClick={() => setPage("diagnosis")}><span className="tool-icon green">⌕</span><h3>{t.diagnosis}</h3><p>Capture or upload a crop image.</p><span className="card-link">Open module →</span></button>
              <button className="tool-card" onClick={() => setPage("market")}><span className="tool-icon gold">↗</span><h3>{t.market}</h3><p>Review price history when data is connected.</p><span className="card-link">Open module →</span></button>
              <button className="tool-card" onClick={() => setPage("profile")}><span className="tool-icon sage">○</span><h3>{t.profile}</h3><p>Maintain your crop and land details.</p><span className="card-link">Open module →</span></button>
            </div>
            <div className="support-strip"><span>✳</span><div><strong>{t.schemes}</strong><p>{t.schemesText}</p></div></div>
          </section>
        )}

        {page === "diagnosis" && (
          <section className="page-content">
            <div className="section-heading"><div><span className="eyebrow">CROP HEALTH</span><h1>{t.diagnosis}</h1><p>{t.cameraHint}</p></div></div>
            <div className="diagnosis-layout">
              <section className="content-card">
                <label className="field-label">{t.chooseCrop}</label>
                <div className="crop-select-grid">
                  {crops.map((item) => <button key={item} className={`crop-choice ${crop === item ? "selected" : ""}`} onClick={() => setCrop(item)}><span>{item === "Banana" ? "🍃" : "🌴"}</span><strong>{language === "ta" ? item === "Banana" ? "வாழை" : "தென்னை" : item}</strong><span className="radio-dot">{crop === item ? "✓" : ""}</span></button>)}
                </div>
                <div className="upload-box">
                  {photo ? <img className="photo-preview" src={photo.url} alt="Selected crop" /> : <div className="upload-placeholder"><span>＋</span><strong>{t.selectPhoto}</strong><p>JPG, PNG or WEBP · up to 10 MB</p></div>}
                  <div className="upload-actions">
                    <button className="primary-button" onClick={() => cameraRef.current?.click()}>▣ {t.takePhoto}</button>
                    <button className="secondary-button" onClick={() => galleryRef.current?.click()}>▧ {t.gallery}</button>
                  </div>
                  <input ref={cameraRef} className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={choosePhoto} />
                  <input ref={galleryRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} />
                </div>
                <button className="primary-button full-width" disabled={!photo} onClick={() => { setMessage(t.noModelText); setIsError(false); }}>{t.analyze}</button>
              </section>
              <section className="content-card result-card">
                <span className="result-symbol">✳</span><span className="eyebrow">ANALYSIS RESULT</span><h2>{t.noModel}</h2><p>{t.noModelText}</p>
                <div className="result-divider" /><h3>{t.recommendation}</h3><p>{t.recommendationText}</p>
                {message && <p className={isError ? "alert error" : "alert"}>{message}</p>}
              </section>
            </div>
          </section>
        )}

        {page === "market" && (
          <section className="page-content">
            <div className="section-heading"><div><span className="eyebrow">MARKET INTELLIGENCE</span><h1>{t.market}</h1><p>Understand price movement before making selling decisions.</p></div></div>
            <div className="market-filter">
              <label>{t.chooseCrop}<select value={crop} onChange={(event) => setCrop(event.target.value)}><option value="Banana">Banana / வாழை</option><option value="Coconut">Coconut / தென்னை</option></select></label>
              <label>Market data source<select value="pending" disabled><option value="pending">Not connected</option></select></label>
            </div>
            <div className="market-empty">
              <span className="chart-icon">↗</span><h2>Market data connection required</h2><p>{t.marketText}</p><div className="empty-chart"><span>Price</span><div className="chart-grid-lines" /><span>Date →</span></div><small>No price values or trend are displayed until verified data is available.</small>
            </div>
          </section>
        )}

        {page === "profile" && (
          <section className="page-content">
            <div className="section-heading"><div><span className="eyebrow">YOUR FARM</span><h1>{t.profile}</h1><p>{t.profileText}</p></div></div>
            <form className="content-card profile-form" onSubmit={saveProfile}>
              <label>{t.name}<input name="full_name" value={profile.full_name ?? ""} onChange={setProfileField} required /></label>
              <label>{t.phone}<input name="phone" type="tel" value={profile.phone ?? ""} onChange={setProfileField} /></label>
              <label>{t.district}<input name="district" value={profile.district ?? ""} onChange={setProfileField} /></label>
              <label>{t.village}<input name="village" value={profile.village ?? ""} onChange={setProfileField} /></label>
              <label>{t.land}<input name="land_size_acres" type="number" min="0" step="0.01" value={profile.land_size_acres ?? ""} onChange={setProfileField} /></label>
              <label>{t.ownership}<select name="land_ownership" value={profile.land_ownership ?? ""} onChange={setProfileField}><option value="">Select</option><option value="owned">{t.owned}</option><option value="leased">{t.leased}</option><option value="other">{t.other}</option></select></label>
              <fieldset><legend>{t.chooseCrop}</legend>{crops.map((item) => <label className="check-label" key={item}><input type="checkbox" checked={(profile.crops ?? []).includes(item)} onChange={() => setProfile({ ...profile, crops: (profile.crops ?? []).includes(item) ? profile.crops.filter((value) => value !== item) : [...(profile.crops ?? []), item] })} />{language === "ta" ? item === "Banana" ? "வாழை" : "தென்னை" : item}</label>)}</fieldset>
              {message && <p className={isError ? "alert error" : "alert"}>{message}</p>}
              <button className="primary-button" disabled={busy}>{busy ? t.loading : t.save}</button>
            </form>
          </section>
        )}

        <footer className="app-footer">AGRISENSE · Crop health and farmer welfare</footer>
      </main>

      <nav className="mobile-nav">
        {navItems.map((item) => <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => { setPage(item.id); setMessage(""); }}><span>{item.icon}</span><small>{item.label}</small></button>)}
      </nav>
    </div>
  );
}

export default App;
