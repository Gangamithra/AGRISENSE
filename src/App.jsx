import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

const emptyProfile = {
  full_name: "",
  phone: "",
  preferred_language: "en",
  state: "Tamil Nadu",
  district: "",
  village: "",
  crops: [],
  land_size_acres: "",
  farmer_category: "",
  land_ownership: "",
};

const words = {
  en: {
    brand: "AGRISENSE",
    tagline: "Smarter farming starts here.",
    login: "Welcome back",
    signup: "Create your account",
    loginSub: "Sign in to continue to your farmer dashboard.",
    signupSub: "Join AGRISENSE to access crop health and farmer support tools.",
    name: "Full name",
    email: "Email address",
    password: "Password",
    phone: "Phone number",
    signIn: "Sign in",
    signUp: "Create account",
    noAccount: "New to AGRISENSE?",
    haveAccount: "Already have an account?",
    create: "Sign up",
    switchLogin: "Sign in",
    dashboard: "Farmer dashboard",
    welcome: "Welcome",
    profile: "Farmer profile",
    profileSub: "Complete your details for more relevant scheme recommendations.",
    district: "District",
    village: "Village / Town",
    crops: "Crops you grow",
    banana: "Banana",
    coconut: "Coconut",
    land: "Land size (acres)",
    category: "Farmer category",
    small: "Small farmer",
    marginal: "Marginal farmer",
    other: "Other",
    ownership: "Land ownership",
    owned: "Owned",
    leased: "Leased",
    shared: "Shared / Other",
    save: "Save profile",
    saved: "Profile saved successfully.",
    logout: "Sign out",
    diagnosis: "Crop disease detection",
    diagnosisSub: "Upload a crop photo to begin diagnosis when the AI model is connected.",
    prices: "Market price insights",
    pricesSub: "Compare market prices for your crops.",
    schemes: "Schemes & insurance",
    schemesSub: "Explore support relevant to your farmer profile.",
    recovery: "Recovery tracking",
    recoverySub: "Track crop recovery with follow-up photos.",
    language: "Language",
    loading: "Loading...",
    confirm: "Account created. Check your email for a confirmation link, then sign in.",
    error: "Something went wrong.",
    chooseCrop: "Select at least one crop.",
    saveError: "Could not save your profile. Please try again.",
  },
  ta: {
    brand: "AGRISENSE",
    tagline: "திறமையான விவசாயம் இங்கே தொடங்குகிறது.",
    login: "மீண்டும் வரவேற்கிறோம்",
    signup: "கணக்கை உருவாக்கவும்",
    loginSub: "விவசாயி டாஷ்போர்டைத் தொடர உள்நுழையவும்.",
    signupSub: "பயிர் ஆரோக்கியம் மற்றும் விவசாயி ஆதரவு வசதிகளைப் பெற இணையுங்கள்.",
    name: "முழுப் பெயர்",
    email: "மின்னஞ்சல் முகவரி",
    password: "கடவுச்சொல்",
    phone: "தொலைபேசி எண்",
    signIn: "உள்நுழைக",
    signUp: "கணக்கை உருவாக்கு",
    noAccount: "புதிய AGRISENSE பயனரா?",
    haveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    create: "பதிவு செய்க",
    switchLogin: "உள்நுழைக",
    dashboard: "விவசாயி டாஷ்போர்டு",
    welcome: "வணக்கம்",
    profile: "விவசாயி விவரங்கள்",
    profileSub: "பொருத்தமான திட்டப் பரிந்துரைகளுக்காக உங்கள் விவரங்களை நிரப்பவும்.",
    district: "மாவட்டம்",
    village: "கிராமம் / நகரம்",
    crops: "நீங்கள் பயிரிடும் பயிர்கள்",
    banana: "வாழை",
    coconut: "தென்னை",
    land: "நில அளவு (ஏக்கர்)",
    category: "விவசாயி வகை",
    small: "சிறு விவசாயி",
    marginal: "குறு விவசாயி",
    other: "மற்றவை",
    ownership: "நில உரிமை",
    owned: "சொந்த நிலம்",
    leased: "குத்தகை",
    shared: "பகிர்வு / மற்றவை",
    save: "விவரங்களைச் சேமி",
    saved: "விவரங்கள் வெற்றிகரமாகச் சேமிக்கப்பட்டன.",
    logout: "வெளியேறு",
    diagnosis: "பயிர் நோய் கண்டறிதல்",
    diagnosisSub: "AI மாதிரி இணைக்கப்பட்டதும் பயிர் புகைப்படத்தைப் பதிவேற்றலாம்.",
    prices: "சந்தை விலை விவரங்கள்",
    pricesSub: "உங்கள் பயிர்களின் சந்தை விலைகளை ஒப்பிடுங்கள்.",
    schemes: "அரசுத் திட்டங்கள் மற்றும் காப்பீடு",
    schemesSub: "உங்கள் விவரங்களுக்குப் பொருத்தமான உதவித் திட்டங்களைப் பாருங்கள்.",
    recovery: "மீட்பு கண்காணிப்பு",
    recoverySub: "தொடர்புப் புகைப்படங்கள் மூலம் பயிர் மீட்சியைக் கண்காணியுங்கள்.",
    language: "மொழி",
    loading: "ஏற்றப்படுகிறது...",
    confirm: "கணக்கு உருவாக்கப்பட்டது. மின்னஞ்சலை உறுதிப்படுத்தி, பின்னர் உள்நுழையவும்.",
    error: "பிழை ஏற்பட்டது.",
    chooseCrop: "குறைந்தது ஒரு பயிரையாவது தேர்வு செய்யவும்.",
    saveError: "விவரங்களைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
  },
};

function App() {
  const [language, setLanguage] = useState("en");
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [profile, setProfile] = useState(emptyProfile);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });

  const t = words[language];

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        setMessage(error.message);
        setIsError(true);
      }

      setUser(data?.session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

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
        setProfile({
          ...emptyProfile,
          ...data,
          crops: data.crops ?? [],
          land_size_acres: data.land_size_acres ?? "",
        });
      } else if (!error) {
        const metadata = user.user_metadata ?? {};

        setProfile({
          ...emptyProfile,
          full_name: metadata.full_name ?? user.email?.split("@")[0] ?? "",
          phone: metadata.phone ?? "",
          district: metadata.district ?? "",
          village: metadata.village ?? "",
          crops: metadata.crops ?? [],
          land_size_acres: metadata.land_size_acres ?? "",
          farmer_category: metadata.farmer_category ?? "",
          land_ownership: metadata.land_ownership ?? "",
          preferred_language: metadata.preferred_language ?? language,
        });
      } else {
        setMessage(error.message);
        setIsError(true);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function updateProfile(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  function toggleCrop(crop) {
    setProfile((current) => ({
      ...current,
      crops: current.crops.includes(crop)
        ? current.crops.filter((item) => item !== crop)
        : [...current.crops, crop],
    }));
  }

  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (mode === "signup" && !form.full_name.trim()) {
      setMessage("Please enter your full name.");
      setIsError(true);
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: form.full_name.trim(),
              phone: form.phone.trim(),
              preferred_language: language,
              crops: [],
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          setUser(data.user);
          setMessage("Account created successfully.");
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
      setSubmitting(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (!profile.crops.length) {
      setMessage(t.chooseCrop);
      setIsError(true);
      return;
    }

    setSubmitting(true);

    const payload = {
      id: user.id,
      full_name: profile.full_name.trim(),
      phone: profile.phone.trim() || null,
      preferred_language: language,
      state: profile.state || "Tamil Nadu",
      district: profile.district.trim() || null,
      village: profile.village.trim() || null,
      crops: profile.crops,
      land_size_acres:
        profile.land_size_acres === "" ? null : Number(profile.land_size_acres),
      farmer_category: profile.farmer_category || null,
      land_ownership: profile.land_ownership || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("farmer_profiles")
      .upsert(payload, { onConflict: "id" });

    setSubmitting(false);

    if (error) {
      setMessage(`${t.saveError} ${error.message}`);
      setIsError(true);
      return;
    }

    setProfile((current) => ({
      ...current,
      ...payload,
      land_size_acres: payload.land_size_acres ?? "",
    }));
    setMessage(t.saved);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
      setIsError(true);
      return;
    }

    setUser(null);
    setProfile(emptyProfile);
    setMessage("");
    setMode("login");
  }

  if (loading) {
    return <main className="app-loading">{t.loading}</main>;
  }

  return (
    <main className="agr-app">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="AGRISENSE home">
          <span className="brand-mark">A</span>
          <span>{t.brand}</span>
        </a>

        <div className="topbar-actions">
          <label className="language-control">
            <span>{t.language}</span>
            <select
              value={language}
              onChange={(event) => {
                const nextLanguage = event.target.value;
                setLanguage(nextLanguage);
                setProfile((current) => ({
                  ...current,
                  preferred_language: nextLanguage,
                }));
              }}
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
            </select>
          </label>

          {user && (
            <button className="button button-outline" onClick={handleLogout}>
              {t.logout}
            </button>
          )}
        </div>
      </header>

      {!user ? (
        <section className="auth-layout" id="home">
          <div className="auth-intro">
            <span className="eyebrow">CROP HEALTH · FARMER WELFARE</span>
            <h1>{t.tagline}</h1>
            <p>
              Practical crop-health support and farmer-focused tools for
              banana and coconut cultivation.
            </p>

            <div className="auth-benefits">
              <div><span>01</span> {t.diagnosis}</div>
              <div><span>02</span> {t.schemes}</div>
              <div><span>03</span> {t.prices}</div>
            </div>
          </div>

          <section className="auth-card">
            <div className="auth-card-heading">
              <span className="section-kicker">{t.brand}</span>
              <h2>{mode === "login" ? t.login : t.signup}</h2>
              <p>{mode === "login" ? t.loginSub : t.signupSub}</p>
            </div>

            <form onSubmit={handleAuth} className="form-stack">
              {mode === "signup" && (
                <>
                  <label className="field">
                    <span>{t.name}</span>
                    <input
                      name="full_name"
                      autoComplete="name"
                      value={form.full_name}
                      onChange={updateForm}
                      required
                      maxLength={100}
                    />
                  </label>

                  <label className="field">
                    <span>{t.phone}</span>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={updateForm}
                      maxLength={20}
                    />
                  </label>
                </>
              )}

              <label className="field">
                <span>{t.email}</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={updateForm}
                  required
                />
              </label>

              <label className="field">
                <span>{t.password}</span>
                <input
                  name="password"
                  type="password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  value={form.password}
                  onChange={updateForm}
                  minLength={6}
                  required
                />
                {mode === "signup" && (
                  <small>Use at least 6 characters.</small>
                )}
              </label>

              {message && (
                <p
                  className={`notice ${isError ? "notice-error" : "notice-success"}`}
                  role="status"
                >
                  {message}
                </p>
              )}

              <button
                className="button button-primary button-wide"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? t.loading
                  : mode === "login"
                    ? t.signIn
                    : t.signUp}
              </button>
            </form>

            <p className="auth-switch">
              {mode === "login" ? t.noAccount : t.haveAccount}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setMessage("");
                  setIsError(false);
                }}
              >
                {mode === "login" ? t.create : t.switchLogin}
              </button>
            </p>
          </section>
        </section>
      ) : (
        <section className="dashboard" id="home">
          <div className="dashboard-heading">
            <div>
              <span className="eyebrow">AGRISENSE · FARMER SPACE</span>
              <h1>{t.dashboard}</h1>
              <p>
                {t.welcome},{" "}
                {profile.full_name || user.user_metadata?.full_name || user.email}
              </p>
            </div>
            <span className="signed-in-label">● Signed in</span>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-number">01</span>
              <h3>{t.diagnosis}</h3>
              <p>{t.diagnosisSub}</p>
              <span className="feature-status">AI integration pending</span>
            </article>
            <article className="feature-card">
              <span className="feature-number">02</span>
              <h3>{t.prices}</h3>
              <p>{t.pricesSub}</p>
              <span className="feature-status">Market data integration pending</span>
            </article>
            <article className="feature-card">
              <span className="feature-number">03</span>
              <h3>{t.schemes}</h3>
              <p>{t.schemesSub}</p>
              <span className="feature-status">Matching module pending</span>
            </article>
            <article className="feature-card">
              <span className="feature-number">04</span>
              <h3>{t.recovery}</h3>
              <p>{t.recoverySub}</p>
              <span className="feature-status">Tracking module pending</span>
            </article>
          </div>

          <section className="profile-card">
            <div className="profile-heading">
              <div>
                <span className="section-kicker">YOUR INFORMATION</span>
                <h2>{t.profile}</h2>
                <p>{t.profileSub}</p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="profile-form">
              <label className="field">
                <span>{t.name}</span>
                <input
                  name="full_name"
                  value={profile.full_name}
                  onChange={updateProfile}
                  required
                  maxLength={100}
                />
              </label>

              <label className="field">
                <span>{t.phone}</span>
                <input
                  name="phone"
                  type="tel"
                  value={profile.phone ?? ""}
                  onChange={updateProfile}
                  maxLength={20}
                />
              </label>

              <label className="field">
                <span>{t.district}</span>
                <input
                  name="district"
                  value={profile.district ?? ""}
                  onChange={updateProfile}
                  placeholder="e.g. Coimbatore"
                />
              </label>

              <label className="field">
                <span>{t.village}</span>
                <input
                  name="village"
                  value={profile.village ?? ""}
                  onChange={updateProfile}
                />
              </label>

              <fieldset className="crop-fieldset">
                <legend>{t.crops}</legend>
                <div className="crop-checkboxes">
                  <label className="crop-check">
                    <input
                      type="checkbox"
                      checked={profile.crops.includes("Banana")}
                      onChange={() => toggleCrop("Banana")}
                    />
                    {t.banana}
                  </label>
                  <label className="crop-check">
                    <input
                      type="checkbox"
                      checked={profile.crops.includes("Coconut")}
                      onChange={() => toggleCrop("Coconut")}
                    />
                    {t.coconut}
                  </label>
                </div>
              </fieldset>

              <label className="field">
                <span>{t.land}</span>
                <input
                  name="land_size_acres"
                  type="number"
                  min="0"
                  step="0.01"
                  value={profile.land_size_acres}
                  onChange={updateProfile}
                />
              </label>

              <label className="field">
                <span>{t.category}</span>
                <select
                  name="farmer_category"
                  value={profile.farmer_category ?? ""}
                  onChange={updateProfile}
                >
                  <option value="">Select</option>
                  <option value="marginal">{t.marginal}</option>
                  <option value="small">{t.small}</option>
                  <option value="other">{t.other}</option>
                </select>
              </label>

              <label className="field">
                <span>{t.ownership}</span>
                <select
                  name="land_ownership"
                  value={profile.land_ownership ?? ""}
                  onChange={updateProfile}
                >
                  <option value="">Select</option>
                  <option value="owned">{t.owned}</option>
                  <option value="leased">{t.leased}</option>
                  <option value="shared">{t.shared}</option>
                </select>
              </label>

              {message && (
                <p
                  className={`notice ${isError ? "notice-error" : "notice-success"}`}
                  role="status"
                >
                  {message}
                </p>
              )}

              <button
                className="button button-primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? t.loading : t.save}
              </button>
            </form>
          </section>
        </section>
      )}

      <footer className="app-footer">
        AGRISENSE · Supporting informed farming decisions
      </footer>
    </main>
  );
}

export default App;