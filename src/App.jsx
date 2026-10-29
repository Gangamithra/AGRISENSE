
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

const tamilDiseaseNames = {
  "Black Sigatoka": "Black Sigatoka (வாழை இலைகளில் கரும்புள்ளிகளை ஏற்படுத்தும் நோய்)",
  "Fusarium Wilt": "Fusarium Wilt (வாழை வாடல் நோய்)",
  "Healthy": "ஆரோக்கியமான பயிர்",
  "Bud Root Dropping": "Bud Root Dropping (தென்னையின் மொட்டு மற்றும் வேர் பாதிப்பு)",
  "Bud Rot": "Bud Rot (தென்னையின் மொட்டு அழுகல் நோய்)",
  "Gray Leaf Spot": "Gray Leaf Spot (சாம்பல் இலைப்புள்ளி நோய்)",
  "Leaf Rot": "Leaf Rot (இலை அழுகல் நோய்)",
  "Stem Bleeding": "Stem Bleeding (தண்டிலிருந்து திரவம் கசியும் நோய்)",
};

const tamilCropNames = {
  Banana: "வாழை",
  Coconut: "தென்னை",
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
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState(emptyProfile);
  const [crop, setCrop] = useState("Banana");
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [isError, setIsError] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
const [diagnosing, setDiagnosing] = useState(false);
  const galleryRef = useRef(null);
  const t = labels[language];
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === "PASSWORD_RECOVERY") {
          setMode("reset");
          setForm((current) => ({ ...current, password: "" }));
          setShowPassword(false);
          setMessage("");
          setIsError(false);
        }
      }
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

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function setField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function setProfileField(event) {
    setProfile({ ...profile, [event.target.name]: event.target.value });
  }
  async function openLiveCamera() {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Live camera is unavailable here. Open AGRISENSE using HTTPS or localhost."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }
        },
        audio: false
      });

      streamRef.current = stream;
      setCameraOpen(true);

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {
            setCameraError("Unable to start the camera preview.");
          });
        }
      });
    } catch (error) {
      setCameraError(
        error.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in your browser settings."
          : "Unable to open the camera. Check that it is connected and not being used by another app."
      );
    }
  }

  function closeLiveCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  function captureLivePhoto() {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError("Wait for the camera preview to load, then try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError("Could not capture the photo. Please try again.");
        return;
      }

      const file = new File([blob], "agrisense-crop.jpg", {
        type: "image/jpeg"
      });

      choosePhoto({ target: { files: [file], value: "" } });
      closeLiveCamera();
    }, "image/jpeg", 0.92);
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
  async function analyzeCrop() {
    if (!photo?.file) {
      setMessage("Please select a crop photo first.");
      setIsError(true);
      return;
    }

    setDiagnosing(true);
    setDiagnosisResult(null);
    setMessage("");
    setIsError(false);

    try {
      const formData = new FormData();
      formData.append("file", photo.file);

      const response = await fetch(
        `http://127.0.0.1:8000/predict/${crop.toLowerCase()}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed.");
      }

      if (language === "ta") {
        try{
          const translationResponse = await fetch(
          "http://127.0.0.1:8000/translate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              texts: [
                `Prediction: ${data.predicted_class}.`,
                `Confidence: ${Number(data.confidence).toFixed(2)}.`,
              ],
              target_language: "Tamil",
            }),
            signal: AbortSignal.timeout(15000),
          }
        );
          const translationData = await translationResponse.json();

          if (translationResponse.ok) {
            data.translatedTexts = translationData.translations;
            data.translationFallback = translationData.fallback === true;
          } else {
            data.translationFallback = true;
          }
        } catch {
          data.translationFallback = true;
        }
      }

      setDiagnosisResult(data);
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to connect to the AI model. Check that the Python API is running."
      );
      setIsError(true);
    } finally {
      setDiagnosing(false);
    }
  }


  async function sendPasswordReset() {
    const email = form.email.trim();

    if (!email) {
      setMessage("Enter your email address first.");
      setIsError(true);
      return;
    }

    setBusy(true);
    setMessage("");
    setIsError(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setMessage("If an account exists for this email, a password reset link will be sent.");
    } catch (error) {
      setMessage(error.message || "Unable to request a password reset.");
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  async function authenticate(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setIsError(false);

    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({
          password: form.password,
        });
        if (error) throw error;

        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;

        setMode("login");
        setForm((current) => ({ ...current, password: "" }));
        setShowPassword(false);
        setMessage("Password updated successfully. Please sign in.");
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: form.full_name.trim(),
              preferred_language: language,
            },
          },
        });
        if (error) throw error;

        setForm((current) => ({ ...current, password: "" }));
        setShowPassword(false);

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

        setForm((current) => ({ ...current, password: "" }));
        setShowPassword(false);
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

  if (!user || mode === "reset") {
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
          <h2>
            {mode === "login" ? t.login : mode === "signup" ? t.signup : "Reset password"}
          </h2>
          <p className="muted">
            {mode === "reset" ? "Enter a new password for your account." : t.signInText}
          </p>
          <form onSubmit={authenticate} className="form-stack">
            {mode === "signup" && (
              <label>
                {t.name}
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={setField}
                  required
                  maxLength={100}
                  autoComplete="name"
                />
              </label>
            )}

            {mode !== "reset" && (
              <label>
                {t.email}
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={setField}
                  required
                  autoComplete="email"
                />
              </label>
            )}

            <label className="password-label">
              {mode === "reset" ? "New password" : t.password}
              <span className="password-field">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={setField}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </span>
            </label>

            {message && <p className={isError ? "alert error" : "alert"}>{message}</p>}
            <button className="primary-button full-width" disabled={busy}>
              {busy
                ? t.loading
                : mode === "reset"
                  ? "Update password"
                  : mode === "login"
                    ? t.login
                    : t.signup}
            </button>
          </form>

          {mode === "login" && (
            <button
              type="button"
              className="text-button forgot-link"
              onClick={sendPasswordReset}
              disabled={busy}
            >
              Forgot password?
            </button>
          )}

          {mode !== "reset" && (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setForm((current) => ({ ...current, password: "" }));
                setShowPassword(false);
                setMessage("");
                setIsError(false);
              }}
            >
              {mode === "login" ? t.switchSignup : t.switchLogin}
            </button>
          )}
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
                    <button
                      type="button"
                      className="primary-button"
                      onClick={openLiveCamera}
                    >
                      ▣ Open Camera
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => galleryRef.current?.click()}
                    >
                      ▧ {t.gallery}
                    </button>
                  </div>
                  <input
                    ref={galleryRef}
                    className="visually-hidden"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={choosePhoto}
                  />
                  {cameraError && <p className="alert error">{cameraError}</p>}
                  {cameraOpen && (
                    <div className="camera-preview">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: "100%",
                          maxHeight: "400px",
                          objectFit: "cover",
                          borderRadius: "16px",
                          background: "#111",
                        }}
                      />
                      <div className="upload-actions">
                        <button
                          type="button"
                          className="primary-button"
                          onClick={captureLivePhoto}
                        >
                          Capture Photo
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={closeLiveCamera}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
  className="primary-button full-width"
  disabled={!photo || diagnosing}
  onClick={analyzeCrop}
>
  {diagnosing ? "Analyzing..." : t.analyze}
</button>
              </section>

<section className="content-card result-card">
  <span className="result-symbol">✳</span>

<span className="eyebrow">ANALYSIS RESULT</span>

{diagnosisResult ? (
  <>
    <h2>
  {language === "ta"
    ? tamilDiseaseNames[diagnosisResult.predicted_class] ||
      diagnosisResult.predicted_class
    : diagnosisResult.predicted_class}
</h2>
<p>
  {language === "ta" ? "பயிர்" : "Crop"}:{" "}
  {language === "ta"
    ? tamilCropNames[diagnosisResult.crop] || diagnosisResult.crop
    : diagnosisResult.crop}
</p>
<p>
  {language === "ta" ? "மாதிரியின் நம்பகத்தன்மை" : "Model confidence"}:{" "}
  {(diagnosisResult.confidence * 100).toFixed(2)}%
</p>

    {language === "ta" && diagnosisResult.translationFallback && (
      <p className="alert">
        தமிழ் மொழிபெயர்ப்பு தற்காலிகமாக கிடைக்கவில்லை. கீழே உள்ள நோய் பெயர் ஆங்கிலத்தில் காட்டப்படலாம்.
      </p>
    )}

    <div className="result-divider" />

    <h3>{language === "ta" ? "கணிப்பு நிகழ்தகவுகள்" : "Prediction probabilities"}</h3>

    {Object.entries(diagnosisResult.probabilities || {})
      .sort((a, b) => b[1] - a[1])
      .map(([name, probability]) => (
        <div key={name} className="probability-row">
          <div className="probability-label">
          <span>
  {language === "ta" ? tamilDiseaseNames[name] || name : name}
</span>
            <strong>{(probability * 100).toFixed(1)}%</strong>
          </div>
          <div className="probability-track">
            <div
              className="probability-fill"
              style={{
                width: `${Math.min(100, Math.max(0, probability * 100))}%`,
              }}
            />
          </div>
        </div>
      ))}

    <p className="alert">
      {language === "ta"
        ? "இது AI கணிப்பு மட்டுமே; உறுதிப்படுத்தப்பட்ட கள நோய் கண்டறிதல் அல்ல. சிகிச்சை அளிப்பதற்கு முன் வேளாண் அலுவலரிடம் ஆலோசனை பெறவும்."
        : "This is an AI prediction, not a confirmed field diagnosis. Seek advice from an agricultural officer before applying treatments."}
    </p>
  </>
) : (
  <>
    <h2>
      {diagnosing
        ? language === "ta" ? "படம் ஆய்வு செய்யப்படுகிறது..." : "Analyzing crop image..."
        : language === "ta" ? "உங்கள் நோய் கண்டறிதல் இங்கே தோன்றும்" : "Your diagnosis will appear here"}
    </h2>
    <p>
      {diagnosing
        ? language === "ta" ? "பயிற்றுவிக்கப்பட்ட மாதிரி படத்தை ஆய்வு செய்கிறது." : "The trained model is examining your image."
        : language === "ta"
          ? "வாழை அல்லது தென்னையைத் தேர்ந்தெடுத்து, படத்தைப் பதிவேற்றி, பகுப்பாய்வு செய்யவும்."
          : "Choose Banana or Coconut, upload a photo, and select Analyze image."}
    </p>
  </>
)}

<div className="result-divider" />

<h3>{t.recommendation}</h3>
<p>{t.recommendationText}</p>


  {message && (
    <p className={isError ? "alert error" : "alert"}>
      {message}
    </p>
  )}
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
