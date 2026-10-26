
// import { useEffect, useState } from "react";
// import "./Skills.css";

// const API = "http://localhost:5000/api/skills";

// const emptyForm = {
//   title: "",
//   category: "",
//   description: "",
//   level: "Beginner",
//   learningType: "Exchange",
//   price: "",
// };

// function Skills({ onBack }) {
//   const [skills, setSkills] = useState([]);
//   const [form, setForm] = useState(emptyForm);
//   const [showForm, setShowForm] = useState(false);
//   const [myListings, setMyListings] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState("");

//   async function fetchSkills(ownListings = false) {
//     setLoading(true);
//     setMessage("");

//     try {
//       const token = sessionStorage.getItem("skillswapToken");

//       if (ownListings && !token) {
//         throw new Error("Please log in to view your listings.");
//       }

//       const response = await fetch(
//         ownListings ? `${API}/mine` : API,
//         ownListings
//           ? { headers: { Authorization: `Bearer ${token}` } }
//           : {}
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Could not load skills.");
//       }

//       setSkills(data);
//       setMyListings(ownListings);
//     } catch (error) {
//       setMessage(error.message || "Could not connect to the server.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchSkills(false);
//   }, []);

//   function handleChange(event) {
//     const { name, value } = event.target;

//     setForm((previous) => ({
//       ...previous,
//       [name]: value,
//       ...(name === "learningType" && value === "Exchange"
//         ? { price: "" }
//         : {}),
//     }));
//   }

//   async function handleSubmit(event) {
//     event.preventDefault();
//     setMessage("");

//     const token = sessionStorage.getItem("skillswapToken");

//     if (!token) {
//       setMessage("Please log in before adding a skill.");
//       return;
//     }

//     if (
//       form.learningType === "Paid" &&
//       (!form.price || Number(form.price) <= 0)
//     ) {
//       setMessage("Enter a price greater than ₹0 for paid skills.");
//       return;
//     }

//     setSaving(true);

//     try {
//       const response = await fetch(API, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           ...form,
//           price:
//             form.learningType === "Exchange" ? 0 : Number(form.price),
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Could not add skill.");
//       }

//       setForm(emptyForm);
//       setShowForm(false);
//       setMessage("Skill published successfully! 🎉");

//       await fetchSkills(myListings);
//     } catch (error) {
//       setMessage(error.message || "Could not connect to the server.");
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function handleDelete(skillId) {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this skill listing?"
//     );

//     if (!confirmed) return;

//     const token = sessionStorage.getItem("skillswapToken");

//     try {
//       const response = await fetch(`${API}/${skillId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Could not delete skill.");
//       }

//       setSkills((previous) =>
//         previous.filter((skill) => skill._id !== skillId)
//       );

//       setMessage("Listing deleted successfully.");
//     } catch (error) {
//       setMessage(error.message || "Could not connect to the server.");
//     }
//   }

//   return (
//     <main className="skills-page">
//       <header className="skills-header">
//         <button className="skills-back" onClick={onBack}>
//           ← Back to Dashboard
//         </button>

//         <p className="skills-eyebrow">
//           LEARN SOMETHING. TEACH SOMETHING.
//         </p>

//         <h1>Explore Skills ✨</h1>
//         <p>Exchange what you know. Discover what you love.</p>

//         <button
//           className="skills-primary"
//           onClick={() => {
//             setMessage("");
//             setShowForm((previous) => !previous);
//           }}
//         >
//           {showForm ? "Close Form" : "+ Add a Skill"}
//         </button>
//       </header>

//       {message && (
//         <p className="skills-message" role="status">
//           {message}
//         </p>
//       )}

//       <div className="skills-tabs">
//         <button
//           className={!myListings ? "skills-primary" : "skills-back"}
//           onClick={() => fetchSkills(false)}
//         >
//           Browse All
//         </button>

//         <button
//           className={myListings ? "skills-primary" : "skills-back"}
//           onClick={() => fetchSkills(true)}
//         >
//           My Listings
//         </button>
//       </div>

//       {showForm && (
//         <form className="skill-form" onSubmit={handleSubmit}>
//           <h2>Share Your Skill</h2>

//           <label>
//             Skill Name
//             <input
//               name="title"
//               value={form.title}
//               onChange={handleChange}
//               placeholder="e.g. Graphic Design"
//               maxLength={100}
//               required
//             />
//           </label>

//           <label>
//             Category
//             <select
//               name="category"
//               value={form.category}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Choose a category</option>
//               <option value="Technology">Technology</option>
//               <option value="Design">Design</option>
//               <option value="Business">Business</option>
//               <option value="Languages">Languages</option>
//               <option value="Arts">Arts & Music</option>
//               <option value="Academics">Academics</option>
//               <option value="Other">Other</option>
//             </select>
//           </label>

//           <label>
//             Description
//             <textarea
//               name="description"
//               value={form.description}
//               onChange={handleChange}
//               placeholder="What will students learn?"
//               maxLength={1000}
//               rows={4}
//               required
//             />
//           </label>

//           <label>
//             Skill Level
//             <select
//               name="level"
//               value={form.level}
//               onChange={handleChange}
//             >
//               <option value="Beginner">Beginner</option>
//               <option value="Intermediate">Intermediate</option>
//               <option value="Advanced">Advanced</option>
//             </select>
//           </label>

//           <label>
//             Teaching Type
//             <select
//               name="learningType"
//               value={form.learningType}
//               onChange={handleChange}
//             >
//               <option value="Exchange">Skill Exchange — Free</option>
//               <option value="Paid">Paid Session</option>
//             </select>
//           </label>

//           {form.learningType === "Paid" && (
//             <label>
//               Price per Session (₹)
//               <input
//                 name="price"
//                 type="number"
//                 min="1"
//                 step="1"
//                 value={form.price}
//                 onChange={handleChange}
//                 placeholder="e.g. 200"
//                 required
//               />
//             </label>
//           )}

//           <button
//             className="skills-primary"
//             type="submit"
//             disabled={saving}
//           >
//             {saving ? "Publishing..." : "Publish Skill"}
//           </button>
//         </form>
//       )}

//       <section className="skills-list">
//         <h2>{myListings ? "My Listings" : "Available Skills"}</h2>

//         {loading ? (
//           <p>Loading skills...</p>
//         ) : skills.length === 0 ? (
//           <div className="skills-empty">
//             <h3>
//               {myListings
//                 ? "You haven't posted any skills yet 🌱"
//                 : "No skills listed yet 🌱"}
//             </h3>
//             <p>
//               {myListings
//                 ? "Add your first skill and share what you know!"
//                 : "Be the first student to share a skill!"}
//             </p>
//           </div>
//         ) : (
//           <div className="skills-grid">
//             {skills.map((skill) => (
//               <article className="skill-card" key={skill._id}>
//                 <span className="skill-category">{skill.category}</span>

//                 <h3>{skill.title}</h3>
//                 <p>{skill.description}</p>

//                 <div className="skill-details">
//                   <span>{skill.level}</span>
//                   <span>
//                     {skill.learningType === "Exchange"
//                       ? "Skill Exchange"
//                       : `₹${skill.price} / session`}
//                   </span>
//                 </div>

//                 <p className="skill-teacher">
//                   Offered by: {skill.offeredBy?.name || "Student"}
//                 </p>

//                 {myListings && (
//                   <button
//                     className="skills-delete"
//                     onClick={() => handleDelete(skill._id)}
//                   >
//                     Delete Listing
//                   </button>
//                 )}
//               </article>
//             ))}
//           </div>
//         )}
//       </section>
//     </main>
//   );
// }

// export default Skills;
