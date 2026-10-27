
// import { useEffect, useState } from "react";
// import "./App.css";
// import Skills from "./Skills";

// const API = "http://localhost:5000/api/auth";

// function App() {
//   const [page, setPage] = useState("home");

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "student",
//   });

//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [user, setUser] = useState(() => {
//     try {
//       return JSON.parse(sessionStorage.getItem("skillswapUser")) || null;
//     } catch {
//       return null;
//     }
//   });

//   const [backendMessage, setBackendMessage] = useState("");

//   useEffect(() => {
//     fetch("http://localhost:5000/")
//       .then((response) => response.json())
//       .then((data) => setBackendMessage(data.message))
//       .catch(() => setBackendMessage(""));
//   }, []);

//   function updateForm(event) {
//     setForm({
//       ...form,
//       [event.target.name]: event.target.value,
//     });
//   }

//   function openPage(nextPage) {
//     setMessage("");
//     setForm({
//       name: "",
//       email: "",
//       password: "",
//       role: "student",
//     });

//     setPage(nextPage);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }

//   function exploreSkills() {
//     if (user) {
//       openPage("skills");
//     } else {
//       openPage("signup");
//     }
//   }

//   async function handleSubmit(event) {
//     event.preventDefault();
//     setMessage("");
//     setLoading(true);

//     try {
//       const endpoint = page === "signup" ? "register" : "login";

//       const payload =
//         page === "signup"
//           ? form
//           : {
//               email: form.email,
//               password: form.password,
//             };

//       const response = await fetch(`${API}/${endpoint}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setMessage(data.message || "Something went wrong.");
//         return;
//       }

//       sessionStorage.setItem("skillswapToken", data.token);
//       sessionStorage.setItem(
//         "skillswapUser",
//         JSON.stringify(data.user)
//       );

//       setUser(data.user);
//       setMessage("");
//       setPage("dashboard");
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } catch {
//       setMessage(
//         "Cannot connect to the server. Make sure your backend is running."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   function logout() {
//     sessionStorage.removeItem("skillswapToken");
//     sessionStorage.removeItem("skillswapUser");
//     setUser(null);
//     openPage("home");
//   }

//   // SIGNUP AND LOGIN PAGES
//   if (page === "signup" || page === "login") {
//     const isSignup = page === "signup";

//     return (
//       <div className="app">
//         <nav className="navbar">
//           <div className="logo" onClick={() => openPage("home")}>
//             Skill<span>Swap</span>
//           </div>

//           <div className="nav-buttons">
//             <button
//               className="login-btn"
//               onClick={() =>
//                 openPage(isSignup ? "login" : "signup")
//               }
//             >
//               {isSignup ? "Log In" : "Sign Up"}
//             </button>
//           </div>
//         </nav>

//         <section className="auth-section">
//           <div className="auth-card">
//             <div className="badge">✨ Learn. Teach. Connect.</div>

//             <h1>
//               {isSignup
//                 ? "Create your account"
//                 : "Welcome back!"}
//             </h1>

//             <p>
//               {isSignup
//                 ? "Start sharing skills and learning from others."
//                 : "Log in to continue your SkillSwap journey."}
//             </p>

//             <form onSubmit={handleSubmit} className="auth-form">
//               {isSignup && (
//                 <>
//                   <label htmlFor="name">Full name</label>
//                   <input
//                     id="name"
//                     name="name"
//                     value={form.name}
//                     onChange={updateForm}
//                     placeholder="Enter your name"
//                     minLength={2}
//                     maxLength={60}
//                     required
//                   />
//                 </>
//               )}

//               <label htmlFor="email">Email address</label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 value={form.email}
//                 onChange={updateForm}
//                 placeholder="you@example.com"
//                 autoComplete="email"
//                 required
//               />

//               <label htmlFor="password">Password</label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 value={form.password}
//                 onChange={updateForm}
//                 placeholder={
//                   isSignup
//                     ? "At least 8 characters"
//                     : "Enter your password"
//                 }
//                 minLength={isSignup ? 8 : undefined}
//                 maxLength={72}
//                 autoComplete={
//                   isSignup ? "new-password" : "current-password"
//                 }
//                 required
//               />

//               {isSignup && (
//                 <>
//                   <label htmlFor="role">I want to join as</label>
//                   <select
//                     id="role"
//                     name="role"
//                     value={form.role}
//                     onChange={updateForm}
//                   >
//                     <option value="student">
//                       Student — learn new skills
//                     </option>
//                     <option value="teacher">
//                       Teacher — share my skills
//                     </option>
//                   </select>
//                 </>
//               )}

//               {message && (
//                 <p className="auth-message" role="alert">
//                   {message}
//                 </p>
//               )}

//               <button
//                 className="primary-btn auth-submit"
//                 type="submit"
//                 disabled={loading}
//               >
//                 {loading
//                   ? "Please wait..."
//                   : isSignup
//                     ? "Create Account →"
//                     : "Log In →"}
//               </button>
//             </form>

//             <p className="auth-switch">
//               {isSignup
//                 ? "Already have an account?"
//                 : "New to SkillSwap?"}{" "}
//               <button
//                 className="text-button"
//                 onClick={() =>
//                   openPage(isSignup ? "login" : "signup")
//                 }
//               >
//                 {isSignup ? "Log in" : "Create an account"}
//               </button>
//             </p>

//             <button
//               className="text-button back-home"
//               onClick={() => openPage("home")}
//             >
//               ← Back to homepage
//             </button>
//           </div>
//         </section>
//       </div>
//     );
//   }

//   // SKILLS PAGE
//   if (page === "skills") {
//     if (!user) {
//       return (
//         <div className="app">
//           <section className="dashboard-section">
//             <h1>Please log in first 💗</h1>
//             <button
//               className="primary-btn"
//               onClick={() => openPage("login")}
//             >
//               Log In →
//             </button>
//             <button
//               className="secondary-btn"
//               onClick={() => openPage("home")}
//             >
//               Back to Home
//             </button>
//           </section>
//         </div>
//       );
//     }

//     return (
//       <Skills
//         onBack={() => openPage("dashboard")}
//       />
//     );
//   }

//   // DASHBOARD
//   if (page === "dashboard" && user) {
//     return (
//       <div className="app">
//         <nav className="navbar">
//           <div
//             className="logo"
//             onClick={() => openPage("home")}
//           >
//             Skill<span>Swap</span>
//           </div>

//           <button className="login-btn" onClick={logout}>
//             Log Out
//           </button>
//         </nav>

//         <section className="dashboard-section">
//           <div className="badge">
//             ✨ You're part of the community
//           </div>

//           <h1>Hey, {user.name}!</h1>
//           <p>Welcome to your SkillSwap dashboard.</p>

//           <div className="dashboard-card">
//             <div className="profile-circle">👋</div>
//             <h2>Your profile</h2>
//             <p>
//               <strong>Name:</strong> {user.name}
//             </p>
//             <p>
//               <strong>Email:</strong> {user.email}
//             </p>
//             <p>
//               <strong>Role:</strong> {user.role}
//             </p>
//           </div>

//           <button
//             className="primary-btn"
//             onClick={() => openPage("skills")}
//           >
//             Explore & Share Skills →
//           </button>

//           <button
//             className="secondary-btn"
//             onClick={() => openPage("home")}
//           >
//             Explore Homepage
//           </button>
//         </section>
//       </div>
//     );
//   }

//   // HOMEPAGE
//   return (
//     <div className="app">
//       <nav className="navbar">
//         <div
//           className="logo"
//           onClick={() => openPage("home")}
//         >
//           Skill<span>Swap</span>
//         </div>

//         <div className="nav-links">
//           <a href="#explore">Explore</a>
//           <a href="#how-it-works">How It Works</a>
//           <a href="#about">About</a>
//         </div>

//         <div className="nav-buttons">
//           {user ? (
//             <button
//               className="login-btn"
//               onClick={() => openPage("dashboard")}
//             >
//               My Dashboard
//             </button>
//           ) : (
//             <>
//               <button
//                 className="login-btn"
//                 onClick={() => openPage("login")}
//               >
//                 Log In
//               </button>

//               <button
//                 className="signup-btn"
//                 onClick={() => openPage("signup")}
//               >
//                 Get Started
//               </button>
//             </>
//           )}
//         </div>
//       </nav>

//       <section className="hero" id="explore">
//         <div className="hero-content">
//           <div className="badge">
//             ✨ Learn. Teach. Connect.
//           </div>

//           {backendMessage && (
//             <div className="backend-status">
//               🟢 {backendMessage}
//             </div>
//           )}

//           <h1>
//             Your skills have
//             <br />
//             <span>more value.</span>
//           </h1>

//           <p>
//             Learn something new, teach what you know,
//             and connect with people who share your interests.
//           </p>

//           <div className="hero-buttons">
//             <button
//               className="primary-btn"
//               onClick={exploreSkills}
//             >
//               Explore Skills →
//             </button>

//             <button
//               className="secondary-btn"
//               onClick={exploreSkills}
//             >
//               Teach a Skill
//             </button>
//           </div>

//           <div className="hero-stats">
//             <div>
//               <strong>500+</strong>
//               <span>Skills</span>
//             </div>
//             <div>
//               <strong>1,000+</strong>
//               <span>Students</span>
//             </div>
//             <div>
//               <strong>4.8★</strong>
//               <span>Average Rating</span>
//             </div>
//           </div>
//         </div>

//         <div className="hero-card">
//           <div className="floating-card top-card">
//             🎨
//             <div>
//               <strong>UI/UX Design</strong>
//               <small>₹250 / session</small>
//             </div>
//           </div>

//           <div className="main-card">
//             <div className="profile-circle">👩🏻‍💻</div>
//             <h3>Learn Figma</h3>
//             <p>
//               Find students who can help you master new skills.
//             </p>
//             <div className="rating">
//               ⭐ 4.9 &nbsp; • &nbsp; 24 sessions
//             </div>
//             <button onClick={exploreSkills}>
//               Get Started
//             </button>
//           </div>

//           <div className="floating-card bottom-card">
//             💻
//             <div>
//               <strong>Python</strong>
//               <small>Skill Swap Available</small>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="features" id="how-it-works">
//         <div className="section-heading">
//           <p>WHY SKILLSWAP?</p>
//           <h2>Learn your way.</h2>
//         </div>

//         <div className="feature-grid">
//           <div className="feature-card">
//             <div className="feature-icon">🔄</div>
//             <h3>Swap Skills</h3>
//             <p>
//               Exchange your knowledge with someone who can
//               teach you something new.
//             </p>
//           </div>

//           <div className="feature-card">
//             <div className="feature-icon">💰</div>
//             <h3>Get Paid</h3>
//             <p>
//               Turn your skills into income by offering paid
//               learning sessions.
//             </p>
//           </div>

//           <div className="feature-card">
//             <div className="feature-icon">🤝</div>
//             <h3>Connect</h3>
//             <p>
//               Meet students and creators who share your
//               interests and goals.
//             </p>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// export default App;
//================
import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import SessionWorkspace from './SessionWorkspace';
//const API = 'http://localhost:5000/api';
const API = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '');
// const API = 'https://skillswap-ny9i.onrender.com/api';
const CATEGORIES = ['Technology', 'Design', 'Business', 'Languages', 'Arts & Music', 'Academics', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const EMPTY_SKILL = { title: '', category: 'Technology', description: '', level: 'Beginner', learningType: 'Exchange', price: '' };
const CATEGORY_ICONS = { Technology: '⌘', Design: '✳', Business: '↗', Languages: '文', 'Arts & Music': '♫', Academics: '⌁', Other: '✦' };

async function api(path, options = {}) {
  const token = sessionStorage.getItem('skillswapToken');
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    sessionStorage.removeItem('skillswapToken'); sessionStorage.removeItem('skillswapUser');
    window.dispatchEvent(new Event('skillswap:logout'));
  }
  if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
  return data;
}
function dateLabel(value) { return value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''; }
function initials(name = 'SkillSwap member') { return name.trim().split(/\s+/).slice(0, 2).map(s => s[0]).join('').toUpperCase(); }

function Brand({ onClick }) { return <button className="brand" onClick={onClick} aria-label="SkillSwap home"><span className="brand-mark">S<span>↗</span></span><span>skill<span className="brand-light">swap</span><small>LEARN · TEACH · GROW</small></span></button>; }
function Nav({ user, page, go, logout }) {
  return <header className="topbar"><div className="topbar-inner"><Brand onClick={() => go('home')} /><nav className="nav-links" aria-label="Main navigation"><button className={page === 'home' ? 'active' : ''} onClick={() => go('home')}>Home</button><button className={page === 'explore' ? 'active' : ''} onClick={() => go('explore')}>Explore skills</button><button onClick={() => { go('home'); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 60); }}>How it works</button><button onClick={() => { go('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 60); }}>About</button></nav><div className="nav-actions">{user ? <><button className="avatar-mini" onClick={() => go('dashboard')} title="Open dashboard">{initials(user.name)}</button><button className="btn btn-dark nav-dashboard" onClick={() => go('dashboard')}>Dashboard <span>↗</span></button><button className="nav-logout" onClick={logout}>Log out</button></> : <><button className="btn btn-quiet" onClick={() => go('login')}>Log in</button><button className="btn btn-dark" onClick={() => go('signup')}>Join SkillSwap <span>↗</span></button></>}</div><button className="mobile-explore" onClick={() => go(user ? 'dashboard' : 'login')}>{user ? 'Dashboard' : 'Log in'} ☰</button></div></header>;
}
function SkillCard({ skill, user, onDetails, onEdit, onDelete, own = false }) {
  return <article className="skill-card"><div className="skill-card-top"><span className="category-icon">{CATEGORY_ICONS[skill.category] || '✦'}</span><span className={`type-pill ${skill.learningType === 'Paid' ? 'paid' : 'exchange'}`}>{skill.learningType === 'Paid' ? 'Paid session' : 'Skill exchange'}</span></div><div className="skill-card-meta">{skill.category} <span>·</span> {skill.level}</div><h3>{skill.title}</h3><p className="skill-description">{skill.description}</p><div className="skill-card-footer"><div className="teacher"><span className="teacher-avatar">{initials(skill.offeredBy?.name)}</span><span><strong>{skill.offeredBy?.name || 'Student'}</strong><small>{skill.offeredBy?.college || 'Student community'}</small></span></div><div className="price">{skill.learningType === 'Paid' ? <>₹{Number(skill.price).toLocaleString('en-IN')}<small>/ session</small></> : <><strong>FREE</strong><small>exchange</small></>}</div></div><div className="skill-card-actions">{own ? <><button className="btn btn-outline btn-small" onClick={() => onEdit(skill)}>Edit listing</button><button className="btn btn-danger-ghost btn-small" onClick={() => onDelete(skill._id)}>Delete</button></> : <button className="btn btn-dark btn-full" onClick={() => onDetails(skill)}>View skill <span>↗</span></button>}</div><div className="skill-card-date">Added {dateLabel(skill.createdAt)}</div></article>;
}
function SkillForm({ initial = EMPTY_SKILL, saving, onCancel, onSave }) {
  const [form, setForm] = useState({ ...EMPTY_SKILL, ...initial, price: initial.price ? String(initial.price) : '' });
  const [error, setError] = useState('');
  function change(e) { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value, ...(name === 'learningType' && value === 'Exchange' ? { price: '' } : {}) })); }
  async function submit(e) { e.preventDefault(); setError(''); if (form.description.trim().length < 10) return setError('Please add a little more detail (at least 10 characters).'); if (form.learningType === 'Paid' && Number(form.price) <= 0) return setError('Set a price greater than ₹0 for paid sessions.'); try { await onSave({ ...form, price: form.learningType === 'Exchange' ? 0 : Number(form.price) }); } catch (err) { setError(err.message); } }
  return <form className="panel-form" onSubmit={submit}><div className="form-grid"><label>Skill title<input name="title" value={form.title} onChange={change} placeholder="e.g. Python for beginners" maxLength="100" minLength="2" required /></label><label>Category<select name="category" value={form.category} onChange={change}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label><label>Skill level<select name="level" value={form.level} onChange={change}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></label><label>Teaching type<select name="learningType" value={form.learningType} onChange={change}><option value="Exchange">Skill exchange · Free</option><option value="Paid">Paid session</option></select></label>{form.learningType === 'Paid' && <label>Price per session (₹)<input type="number" name="price" min="1" step="1" value={form.price} onChange={change} placeholder="e.g. 250" required /></label>}<label className="wide-label">Description<textarea name="description" value={form.description} onChange={change} minLength="10" maxLength="1000" rows="4" placeholder="What will learners be able to do after this session? Include topics, format, or experience level." required /></label></div>{error && <p className="notice error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button><button className="btn btn-dark" disabled={saving}>{saving ? 'Saving…' : 'Publish listing ↗'}</button></div></form>;
}
function AuthPage({ mode, go, onSuccess }) {
  const signup = mode === 'signup';
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  function change(e) { setForm(p => ({ ...p, [e.target.name]: e.target.value })); }
  async function submit(e) { e.preventDefault(); setError(''); setLoading(true); try { const data = await api(`/auth/${signup ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(signup ? form : { email: form.email, password: form.password }) }); sessionStorage.setItem('skillswapToken', data.token); sessionStorage.setItem('skillswapUser', JSON.stringify(data.user)); onSuccess(data.user); } catch (err) { setError(err.message); } finally { setLoading(false); } }
  return <main className="auth-layout"><div className="auth-aside"><Brand onClick={() => go('home')} /><div className="auth-aside-copy"><span className="eyebrow eyebrow-light">A COMMUNITY THAT SHARES</span><h1>Your next skill is closer than you think.</h1><p>Meet curious people, trade knowledge, and make learning a team sport.</p><div className="auth-note"><span className="auth-note-icon">✳</span><span><strong>Give a little knowledge.</strong><small>Get a whole new perspective.</small></span></div></div><span className="auth-aside-foot">SKILLSWAP · BUILT FOR STUDENTS</span></div><section className="auth-main"><button className="back-link" onClick={() => go('home')}>← Back to home</button><div className="auth-box"><span className="eyebrow">YOUR LEARNING JOURNEY STARTS HERE</span><h2>{signup ? 'Create your account' : 'Welcome back'}</h2><p className="muted">{signup ? 'Make an account and start learning from your community.' : 'Log in to pick up where your curiosity left off.'}</p><form onSubmit={submit} className="auth-form">{signup && <label>Full name<input name="name" value={form.name} onChange={change} placeholder="Your name" minLength="2" maxLength="60" autoComplete="name" required /></label>}<label>Email address<input type="email" name="email" value={form.email} onChange={change} placeholder="you@college.edu" autoComplete="email" required /></label><label>Password<input type="password" name="password" value={form.password} onChange={change} placeholder={signup ? 'At least 8 characters' : 'Your password'} minLength={signup ? 8 : undefined} maxLength="72" autoComplete={signup ? 'new-password' : 'current-password'} required /></label>{signup && <label>I'm here to<select name="role" value={form.role} onChange={change}><option value="student">Learn and share as a student</option><option value="teacher">Offer teaching sessions</option></select></label>}{error && <p className="notice error" role="alert">{error}</p>}<button className="btn btn-dark btn-full auth-submit" disabled={loading}>{loading ? 'Please wait…' : signup ? 'Create account ↗' : 'Log in ↗'}</button></form><p className="auth-switch">{signup ? 'Already part of the community?' : 'New to SkillSwap?'} <button onClick={() => go(signup ? 'login' : 'signup')}>{signup ? 'Log in' : 'Create an account'}</button></p><p className="fine-print">By continuing, you agree to be respectful, helpful, and curious.</p></div></section></main>;
}
function Home({ go, stats, skills, user }) {
  return <><main><section className="hero wrap"><div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot" /> THE STUDENT-POWERED SKILL COMMUNITY</span><h1>What if your<br />next teacher was<br /><em>your classmate?</em></h1><p className="hero-lead">Learn something new. Teach what you know. SkillSwap turns the skills around you into opportunities to grow — together.</p><div className="hero-cta"><button className="btn btn-dark btn-large" onClick={() => go('explore')}>Explore skills <span>↗</span></button><button className="btn btn-outline btn-large" onClick={() => user ? go('dashboard') : go('signup')}>Share a skill <span>＋</span></button></div><div className="hero-proof"><div className="avatar-stack"><span>AM</span><span>RK</span><span>JS</span><span>+</span></div><p><strong>A community built on give-and-take.</strong><small>Learn at your pace, on your terms.</small></p></div></div><div className="hero-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-center"><span className="art-star">✳</span><span className="art-word">skill<br /><b>swap</b></span><span className="art-caption">KNOWLEDGE GOES BOTH WAYS</span></div><div className="art-card art-card-top"><span className="art-emoji mint">⌘</span><span><strong>Code something cool</strong><small>Technology · Exchange</small></span><span className="art-arrow">↗</span></div><div className="art-card art-card-left"><span className="art-emoji peach">✳</span><span><strong>Design with confidence</strong><small>Design · Beginner</small></span></div><div className="art-card art-card-bottom"><span className="art-emoji lilac">文</span><span><strong>Speak a new language</strong><small>Languages · All levels</small></span></div><span className="art-spark spark-a">✦</span><span className="art-spark spark-b">✳</span></div></section><section className="stats-strip"><div className="wrap stats-inner"><div><strong>{stats ? stats.skills : '—'}</strong><span>Skills shared</span></div><div><strong>{stats ? stats.users : '—'}</strong><span>Community members</span></div><div><strong>{stats ? stats.exchanges : '—'}</strong><span>Free exchanges</span></div><div className="stats-note">Real numbers.<br /><b>Real student skills.</b></div></div></section><section className="section wrap" id="explore"><div className="section-head"><div><span className="eyebrow">FIND YOUR NEXT THING</span><h2>Small skills.<br /><em>Big possibilities.</em></h2></div><button className="text-link" onClick={() => go('explore')}>Explore all skills <span>↗</span></button></div><div className="category-grid">{CATEGORIES.slice(0, 6).map((cat, i) => <button key={cat} className={`category-tile cat-${i}`} onClick={() => go('explore', { category: cat })}><span className="category-tile-icon">{CATEGORY_ICONS[cat]}</span><strong>{cat}</strong><small>{['Build your tech confidence','Make ideas look good','Turn ideas into action','Connect across cultures','Make room for creativity','Study smarter together'][i]}</small><span className="tile-arrow">↗</span></button>)}</div></section><section className="section section-tint" id="how-it-works"><div className="wrap"><div className="center-head"><span className="eyebrow">SIMPLE BY DESIGN</span><h2>Knowledge is better<br /><em>when it moves.</em></h2><p>No complicated setup. Just people helping people get better at what they love.</p></div><div className="steps-grid"><article className="step-card"><span className="step-number">01</span><span className="step-icon">⌕</span><h3>Find your skill</h3><p>Browse what students around you can teach. Filter by interest, level, and how you want to learn.</p></article><article className="step-card step-featured"><span className="step-number">02</span><span className="step-icon">↔</span><h3>Make the connection</h3><p>Send a learning request with a note. Exchange knowledge for free or request a paid session.</p></article><article className="step-card"><span className="step-number">03</span><span className="step-icon">✳</span><h3>Grow together</h3><p>Coordinate directly, share what works, and keep building skills beyond the classroom.</p></article></div></div></section><section className="section wrap exchange-section" id="about"><div className="exchange-visual"><div className="exchange-circle circle-a">YOU<br /><b>TEACH</b></div><div className="exchange-circle circle-b">YOU<br /><b>LEARN</b></div><span className="exchange-symbol">↔</span><span className="exchange-note">A FAIRER WAY TO LEARN</span></div><div className="exchange-copy"><span className="eyebrow">NOT JUST ANOTHER COURSE</span><h2>Your knowledge<br />is <em>someone else's</em><br />breakthrough.</h2><p>We believe every student has something worth sharing. SkillSwap makes it easier to trade experience, discover new interests, and build confidence — without making learning feel out of reach.</p><ul><li><span>✓</span> Free skill exchanges that work both ways</li><li><span>✓</span> Affordable paid sessions when you need them</li><li><span>✓</span> Student-first, community-led learning</li></ul><button className="btn btn-dark btn-large" onClick={() => go(user ? 'dashboard' : 'signup')}>Be part of it <span>↗</span></button></div></section><section className="section wrap recent-section"><div className="section-head"><div><span className="eyebrow">FRESH FROM THE COMMUNITY</span><h2>Recently shared</h2></div><button className="text-link" onClick={() => go('explore')}>See all skills ↗</button></div>{skills.length ? <div className="skill-grid">{skills.map(s => <SkillCard key={s._id} skill={s} user={user} onDetails={() => go('explore')} />)}</div> : <div className="featured-empty"><span>✳</span><p>Fresh skills from your community will appear here.</p><button className="btn btn-outline" onClick={() => go('explore')}>Explore the marketplace ↗</button></div>}</section><section className="cta-band"><div className="wrap cta-inner"><div><span className="eyebrow eyebrow-light">YOUR NEXT CHAPTER STARTS HERE</span><h2>Ready to swap<br /><em>the way you learn?</em></h2><p>Bring one skill. Leave with a new perspective.</p></div><button className="btn btn-cream btn-large" onClick={() => go(user ? 'explore' : 'signup')}>{user ? 'Explore the marketplace' : 'Join SkillSwap free'} <span>↗</span></button><span className="cta-decoration">✳</span></div></section></main><Footer go={go} /></>;
}
function Footer({ go }) { return <footer className="footer"><div className="wrap footer-main"><div className="footer-brand"><Brand onClick={() => go('home')} /><p>A little knowledge goes a long way.<br />Especially when we share it.</p></div><div><strong>Explore</strong><button onClick={() => go('explore')}>Browse skills</button><button onClick={() => go('signup')}>Share a skill</button><button onClick={() => go('home')}>How it works</button></div><div><strong>SkillSwap</strong><button onClick={() => go('home')}>About us</button><a href="mailto:hello@skillswap.example">Contact: hello@skillswap.example</a><span className="footer-small">Replace this placeholder email before launch.</span></div><div className="footer-mantra">Learn generously.<br /><em>Grow together.</em><span>↗</span></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} SkillSwap. Made for curious students.</span><span>Built on the belief that everyone has something to teach.</span></div></footer>; }

function Explore({ user, initialCategory, go, notify }) {
  const [skills, setSkills] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [search, setSearch] = useState(''); const [category, setCategory] = useState(initialCategory || 'All categories'); const [level, setLevel] = useState('All levels'); const [type, setType] = useState('All types'); const [sort, setSort] = useState('newest'); const [selected, setSelected] = useState(null); const [requestMessage, setRequestMessage] = useState(''); const [requesting, setRequesting] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const p = new URLSearchParams(); if (search.trim()) p.set('search', search.trim()); if (category !== 'All categories') p.set('category', category); if (level !== 'All levels') p.set('level', level); if (type !== 'All types') p.set('learningType', type); p.set('sort', sort); setSkills(await api(`/skills?${p.toString()}`)); } catch (e) { setError(e.message); } finally { setLoading(false); } }, [search, category, level, type, sort]);
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);
  async function requestSkill() { if (!user) { setSelected(null); go('login'); return; } setRequesting(true); try { const result = await api('/requests', { method: 'POST', body: JSON.stringify({ skillId: selected._id, message: requestMessage }) }); notify(result.message); setSelected(null); setRequestMessage(''); } catch (e) { notify(e.message, 'error'); } finally { setRequesting(false); } }
  return <><main className="page-wrap"><div className="market-hero"><div><span className="eyebrow"><span className="eyebrow-dot" /> THE SKILLS MARKETPLACE</span><h1>Find a skill.<br /><em>Find your people.</em></h1><p>Discover what your student community can teach you — from a quick skill swap to a focused paid session.</p></div><div className="market-hero-stamp"><span>LEARN</span><b>↔</b><span>SHARE</span></div></div><div className="market-toolbar"><div className="search-field"><span>⌕</span><input aria-label="Search skills" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills, topics, or keywords…" /><kbd>SEARCH</kbd></div><div className="filter-row"><label><span>Category</span><select value={category} onChange={e => setCategory(e.target.value)}><option>All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label><label><span>Level</span><select value={level} onChange={e => setLevel(e.target.value)}><option>All levels</option>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></label><label><span>Format</span><select value={type} onChange={e => setType(e.target.value)}><option>All types</option><option value="Exchange">Skill exchange</option><option value="Paid">Paid sessions</option></select></label><label><span>Sort by</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Recently added</option><option value="priceAsc">Price: low to high</option><option value="priceDesc">Price: high to low</option></select></label></div></div><div className="results-heading"><div><span className="eyebrow">THE COMMUNITY BOARD</span><h2>{category === 'All categories' ? 'Skills to explore' : category}</h2></div><span className="result-count">{loading ? 'Loading…' : `${skills.length} ${skills.length === 1 ? 'skill' : 'skills'} found`}</span></div>{error && <div className="notice error">{error} <button onClick={load}>Try again</button></div>}{loading ? <div className="loading-grid">{[1,2,3].map(n => <div className="skeleton" key={n} />)}</div> : skills.length ? <div className="skill-grid">{skills.map(s => <SkillCard key={s._id} skill={s} user={user} onDetails={setSelected} />)}</div> : <div className="empty-state"><span>⌕</span><h3>No skills found — yet.</h3><p>Try another search or loosen a filter. Your next learning opportunity might be one click away.</p><button className="btn btn-outline" onClick={() => { setSearch(''); setCategory('All categories'); setLevel('All levels'); setType('All types'); }}>Clear all filters</button>{user && <button className="btn btn-dark" onClick={() => go('dashboard', { tab: 'listings', create: true })}>Be the first to share one ↗</button>}</div>}</main><Footer go={go} />{selected && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="skill-modal-title"><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button><span className="category-icon modal-icon">{CATEGORY_ICONS[selected.category] || '✦'}</span><span className="eyebrow">{selected.category} · {selected.level}</span><h2 id="skill-modal-title">{selected.title}</h2><p className="modal-description">{selected.description}</p><div className="modal-provider"><span className="teacher-avatar large">{initials(selected.offeredBy?.name)}</span><div><strong>{selected.offeredBy?.name || 'Student'}</strong><small>{selected.offeredBy?.college || 'SkillSwap community member'}</small></div><span className={`type-pill ${selected.learningType === 'Paid' ? 'paid' : 'exchange'}`}>{selected.learningType === 'Paid' ? 'Paid session' : 'Skill exchange'}</span></div><div className="modal-price">{selected.learningType === 'Paid' ? <><small>SESSION PRICE</small><strong>₹{Number(selected.price).toLocaleString('en-IN')}</strong><span>Payment is arranged directly. SkillSwap does not process payments.</span></> : <><small>EXCHANGE FORMAT</small><strong>Free · Knowledge for knowledge</strong><span>Connect with the provider to agree on the learning format.</span></>}</div>{user && String(selected.offeredBy?._id || selected.offeredBy) === String(user.id) ? <p className="notice">This is your listing. Manage it from your dashboard.</p> : <><label className="request-message-label">Add a note to your request <span>Optional</span><textarea rows="3" maxLength="500" value={requestMessage} onChange={e => setRequestMessage(e.target.value)} placeholder="Hi! I'd love to learn this because…" /></label><button className="btn btn-dark btn-full" onClick={requestSkill} disabled={requesting}>{requesting ? 'Sending request…' : user ? 'Request to learn ↗' : 'Log in to request this skill ↗'}</button></>}<p className="fine-print">No payment is collected by this website. Agree on session details directly with the provider.</p></section></div>}</>;
}

function Dashboard({ user, go, notify, initialTab = 'overview', createListing = false, onUserUpdate }) {
  const [tab, setTab] = useState(initialTab); const [skills, setSkills] = useState([]); const [incoming, setIncoming] = useState([]); const [outgoing, setOutgoing] = useState([]); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [editing, setEditing] = useState(null); const [showForm, setShowForm] = useState(createListing); const [saving, setSaving] = useState(false); const [profile, setProfile] = useState({ name: user.name || '', bio: user.bio || '', college: user.college || '' }); const [profileSaving, setProfileSaving] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const [mine, inc, out] = await Promise.all([api('/skills/mine'), api('/requests/incoming'), api('/requests/outgoing')]); setSkills(mine); setIncoming(inc); setOutgoing(out); } catch (e) { setError(e.message); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  async function saveSkill(data) { setSaving(true); try { const result = await api(editing ? `/skills/${editing._id}` : '/skills', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(data) }); notify(result.message); setShowForm(false); setEditing(null); await load(); } catch (e) { throw e; } finally { setSaving(false); } }
  async function deleteSkill(id) { if (!window.confirm('Delete this listing? Pending requests for it will be cancelled.')) return; try { const d = await api(`/skills/${id}`, { method: 'DELETE' }); notify(d.message); await load(); } catch (e) { notify(e.message, 'error'); } }
  async function changeRequest(id, status) { try { const d = await api(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); notify(d.message); await load(); } catch (e) { notify(e.message, 'error'); } }
  async function cancelRequest(id) { if (!window.confirm('Cancel this learning request?')) return; try { const d = await api(`/requests/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({}) }); notify(d.message); await load(); } catch (e) { notify(e.message, 'error'); } }
  async function saveProfile(e) { e.preventDefault(); setProfileSaving(true); try { const d = await api('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }); sessionStorage.setItem('skillswapUser', JSON.stringify(d.user)); onUserUpdate(d.user); notify('Your profile has been updated.'); } catch (e) { notify(e.message, 'error'); } finally { setProfileSaving(false); } }
  const pendingIncoming = incoming.filter(r => r.status === 'Pending').length;
  const pendingOutgoing = outgoing.filter(r => r.status === 'Pending').length;
  const navItems = [{ id: 'overview', icon: '⌂', label: 'Overview' }, { id: 'profile', icon: '◉', label: 'My profile' }, { id: 'listings', icon: '▤', label: 'My listings', count: skills.length }, { id: 'incoming', icon: '↙', label: 'Incoming requests', count: pendingIncoming }, { id: 'outgoing', icon: '↗', label: 'My learning requests', count: pendingOutgoing }, { id: 'history', icon: '◷', label: 'Request history' }];
  const history = [...incoming.map(r => ({ ...r, direction: 'Incoming' })), ...outgoing.map(r => ({ ...r, direction: 'Outgoing' }))].filter(r => r.status !== 'Pending').sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return <main className="dashboard-layout"><aside className="dash-sidebar"><div className="dash-profile"><span className="profile-avatar">{initials(user.name)}</span><strong>{user.name}</strong><small>{user.email}</small><span className="member-tag">✳ {user.role === 'teacher' ? 'Skill provider' : 'Student member'}</span></div><span className="sidebar-label">WORKSPACE</span>{navItems.map(n => <button key={n.id} className={`dash-nav-item ${tab === n.id ? 'selected' : ''}`} onClick={() => { setTab(n.id); setShowForm(false); setEditing(null); }}><span className="dash-nav-icon">{n.icon}</span>{n.label}{n.count > 0 && <span className="nav-count">{n.count}</span>}</button>)}<div className="sidebar-bottom"><button className="dash-nav-item" onClick={() => go('explore')}><span className="dash-nav-icon">⌕</span>Explore marketplace ↗</button><button className="dash-nav-item" onClick={() => go('home')}><span className="dash-nav-icon">↖</span>Back to website</button></div></aside><section className="dashboard-main"><div className="dash-topline"><div><span className="eyebrow">YOUR SKILLSWAP SPACE</span><h1>{tab === 'overview' ? `Good to see you, ${user.name.split(' ')[0]}.` : navItems.find(n => n.id === tab)?.label || 'Dashboard'}</h1><p>{tab === 'overview' ? 'A little progress, a new connection, a skill at a time.' : 'Keep your learning journey moving forward.'}</p></div><button className="btn btn-dark" onClick={() => { setTab('listings'); setShowForm(true); setEditing(null); }}>＋ Add a skill</button></div>{error && <div className="notice error">{error} <button onClick={load}>Retry</button></div>}{loading && <div className="loading-line">Refreshing your workspace…</div>}{tab === 'overview' && <><div className="dash-metrics"><div className="metric-card metric-highlight"><span>MY LISTINGS</span><strong>{skills.length}</strong><small>Skills you've shared</small><i>▤</i></div><div className="metric-card"><span>INCOMING</span><strong>{incoming.length}</strong><small>{pendingIncoming} awaiting your response</small><i>↙</i></div><div className="metric-card"><span>LEARNING REQUESTS</span><strong>{outgoing.length}</strong><small>{pendingOutgoing} awaiting a response</small><i>↗</i></div></div><div className="dash-content-grid"><section className="dash-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR CONTRIBUTION</span><h2>My latest listings</h2></div><button className="text-link" onClick={() => setTab('listings')}>View all ↗</button></div>{skills.slice(0,3).length ? skills.slice(0,3).map(s => <div className="mini-listing" key={s._id}><span className="mini-listing-icon">{CATEGORY_ICONS[s.category] || '✦'}</span><span><strong>{s.title}</strong><small>{s.category} · {s.learningType === 'Paid' ? `₹${s.price}/session` : 'Skill exchange'}</small></span><button onClick={() => { setTab('listings'); setEditing(s); setShowForm(true); }}>Edit ↗</button></div>) : <div className="panel-empty"><span>✳</span><strong>Your first skill starts here.</strong><p>Share something you know and help someone else grow.</p><button className="btn btn-dark" onClick={() => { setTab('listings'); setShowForm(true); }}>Create a listing ↗</button></div>}</section><section className="dash-panel request-panel"><div className="panel-heading"><div><span className="eyebrow">NEEDS YOUR ATTENTION</span><h2>Incoming requests</h2></div><button className="text-link" onClick={() => setTab('incoming')}>View all ↗</button></div>{incoming.filter(r => r.status === 'Pending').slice(0,3).length ? incoming.filter(r => r.status === 'Pending').slice(0,3).map(r => <RequestRow key={r._id} request={r} direction="incoming" onStatus={changeRequest} onCancel={cancelRequest} />) : <div className="panel-empty compact"><span>↙</span><strong>You're all caught up.</strong><p>New learning requests will appear here.</p></div>}</section></div></>}
{tab === 'profile' && <section className="dash-panel profile-editor"><span className="eyebrow">YOUR INTRODUCTION</span><h2>Make your profile yours.</h2><p className="muted">A few details help other students get to know you.</p><form onSubmit={saveProfile} className="panel-form"><div className="form-grid"><label>Full name<input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} minLength="2" maxLength="60" required /></label><label>College / institution<input value={profile.college} onChange={e => setProfile(p => ({ ...p, college: e.target.value }))} maxLength="120" placeholder="Your college (optional)" /></label><label className="wide-label">Short bio<textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} maxLength="300" rows="4" placeholder="What are you learning or happy to teach?" /></label></div><div className="form-actions"><button className="btn btn-dark" disabled={profileSaving}>{profileSaving ? 'Saving…' : 'Save profile ↗'}</button></div></form><div className="profile-details"><span><small>EMAIL ADDRESS</small><strong>{user.email}</strong></span><span><small>MEMBER SINCE</small><strong>{dateLabel(user.createdAt) || 'SkillSwap member'}</strong></span></div></section>}
{tab === 'listings' && <section className="dash-panel"><div className="panel-heading"><div><span className="eyebrow">WHAT YOU SHARE</span><h2>Manage your listings</h2></div><button className="btn btn-dark" onClick={() => { setEditing(null); setShowForm(v => !v); }}>＋ {showForm ? 'Close form' : 'New listing'}</button></div>{showForm && <div className="listing-form-wrap"><h3>{editing ? 'Edit your listing' : 'Share something you know'}</h3><SkillForm key={editing?._id || 'new'} initial={editing || EMPTY_SKILL} saving={saving} onCancel={() => { setShowForm(false); setEditing(null); }} onSave={saveSkill} /></div>}{skills.length ? <div className="skill-grid dashboard-skill-grid">{skills.map(s => <SkillCard key={s._id} skill={s} own onEdit={item => { setEditing(item); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onDelete={deleteSkill} />)}</div> : !showForm && <div className="empty-state"><span>▤</span><h3>No listings just yet.</h3><p>Everyone starts somewhere. Share a skill to help another student take their next step.</p><button className="btn btn-dark" onClick={() => setShowForm(true)}>Create your first listing ↗</button></div>}</section>}
{tab === 'incoming' && <section className="dash-panel"><div className="panel-heading"><div><span className="eyebrow">PEOPLE WANT TO LEARN FROM YOU</span><h2>Incoming requests</h2></div></div>{incoming.length ? incoming.map(r => <RequestRow key={r._id} request={r} direction="incoming" onStatus={changeRequest} onCancel={cancelRequest} />) : <div className="empty-state"><span>↙</span><h3>No requests yet.</h3><p>When a student requests one of your skills, it will show up here.</p></div>}</section>}
{tab === 'outgoing' && <section className="dash-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR LEARNING JOURNEY</span><h2>My learning requests</h2></div></div>{outgoing.filter(r => r.status === 'Pending' || r.status === 'Accepted').length ? outgoing.filter(r => r.status === 'Pending' || r.status === 'Accepted').map(r => <RequestRow key={r._id} request={r} direction="outgoing" onStatus={changeRequest} onCancel={cancelRequest} />) : <div className="empty-state"><span>↗</span><h3>Ready to learn something new?</h3><p>Explore the marketplace and send a request to a student whose skill interests you.</p><button className="btn btn-dark" onClick={() => go('explore')}>Explore skills ↗</button></div>}</section>}
{tab === 'history' && <section className="dash-panel"><div className="panel-heading"><div><span className="eyebrow">PAST AND CLOSED REQUESTS</span><h2>Request history</h2></div></div>{history.length ? history.map(r => <RequestRow key={`${r.direction}-${r._id}`} request={r} direction={r.direction.toLowerCase()} onStatus={changeRequest} onCancel={cancelRequest} />) : <div className="empty-state"><span>◷</span><h3>Your history will grow here.</h3><p>Accepted, rejected, and cancelled requests will be saved here.</p></div>}</section>}</section></main>;
}

function RequestRow({ request, direction, onStatus, onCancel }) {
  const [showWorkspace, setShowWorkspace] = useState(false);

  const person =
    direction === 'incoming'
      ? request.learner || request.requester
      : request.provider || request.skill?.offeredBy;

  const personName = person?.name || person?.username || 'Member';
  const accepted = request.status === 'Accepted';

  return (
    <article className="request-row">
      <div className="request-row-info">
        <h3>{request.skill?.title || request.skill?.name || 'Skill session'}</h3>
        <p>
          {direction === 'incoming' ? 'Learner' : 'Provider'}: {personName}
        </p>
        {request.message && <p>{request.message}</p>}
        <p>
          Status: <strong>{request.status}</strong>
        </p>
      </div>

      {request.status === 'Pending' && direction === 'incoming' && (
        <div className="request-row-actions">
          <button onClick={() => onStatus(request._id, 'Accepted')}>
            Accept request
          </button>
          <button onClick={() => onStatus(request._id, 'Rejected')}>
            Decline
          </button>
        </div>
      )}

      {request.status === 'Pending' && direction === 'outgoing' && (
        <button onClick={() => onCancel(request._id)}>
          Cancel request
        </button>
      )}

      {accepted && (
        <div className="request-row-actions">
          <button
            type="button"
            onClick={() => setShowWorkspace(value => !value)}
          >
            {showWorkspace ? 'Close workspace ↑' : 'Continue session ↗'}
          </button>
        </div>
      )}

      {showWorkspace && accepted && (
        <div className="request-session-container">
          <SessionWorkspace
            request={request}
            direction={direction}
            api={api}
          />
        </div>
      )}
    </article>
  );
}

export default function App() {
  const [page, setPage] = useState('home'); const [user, setUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem('skillswapUser')) || null; } catch { return null; } }); const [stats, setStats] = useState(null); const [featured, setFeatured] = useState([]); const [toast, setToast] = useState(null); const [exploreOptions, setExploreOptions] = useState({}); const [dashOptions, setDashOptions] = useState({});
  const go = useCallback((next, options = {}) => { setPage(next); if (next === 'explore') setExploreOptions(options); if (next === 'dashboard') setDashOptions(options); window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const notify = useCallback((message, kind = 'success') => { setToast({ message, kind, key: Date.now() }); }, []);
  const logout = useCallback(() => { sessionStorage.removeItem('skillswapToken'); sessionStorage.removeItem('skillswapUser'); setUser(null); go('home'); notify('You have logged out. See you next time.'); }, [go, notify]);
  useEffect(() => { const handle = () => { setUser(null); setPage('login'); }; window.addEventListener('skillswap:logout', handle); return () => window.removeEventListener('skillswap:logout', handle); }, []);
  useEffect(() => { api('/skills/stats/summary').then(setStats).catch(() => {}); api('/skills?sort=newest').then(s => setFeatured(s.slice(0,3))).catch(() => {}); }, [page]);
  const successAuth = u => { setUser(u); go('dashboard'); notify(`Welcome to SkillSwap, ${u.name.split(' ')[0]}!`); };
  if (page === 'login' || page === 'signup') return <><AuthPage mode={page} go={go} onSuccess={successAuth} />{toast && <Toast toast={toast} onClose={() => setToast(null)} />}</>;
  return <div className="app-shell"><Nav user={user} page={page} go={go} logout={logout} />{page === 'home' && <Home go={go} stats={stats} skills={featured} user={user} />}{page === 'explore' && <Explore user={user} initialCategory={exploreOptions.category} go={go} notify={notify} />}{page === 'dashboard' && (user ? <Dashboard key={user.id} user={user} go={go} notify={notify} initialTab={dashOptions.tab} createListing={dashOptions.create} onUserUpdate={setUser} /> : <main className="auth-required"><h1>Your workspace is waiting.</h1><p>Log in to manage your skills and learning requests.</p><button className="btn btn-dark" onClick={() => go('login')}>Log in ↗</button></main>)}{toast && <Toast toast={toast} onClose={() => setToast(null)} />}</div>;
}

function Toast({ toast, onClose }) {
  return (
    <div
      key={toast.key}
      className={`toast ${toast.kind === 'error' ? 'toast-error' : ''}`}
      role="status"
    >
      <span>{toast.kind === 'error' ? '!' : '✓'}</span>
      {toast.message}
      <button onClick={onClose} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  );
}
