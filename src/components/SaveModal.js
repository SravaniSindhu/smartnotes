// import React, { useState } from "react";

// function SaveModal({ close }) {

//   const [title, setTitle] = useState("");
//   const [category, setCategory] = useState("");

//   const saveNote = () => {

//     if (!title || !category) {
//       alert("Title and Category required");
//       return;
//     }

//     console.log(title, category);

//     close();
//   };

//   return (

//     <div className="modal d-block">

//       <div className="modal-dialog">

//         <div className="modal-content p-3">

//           <h4>Save Note</h4>

//           <input
//             className="form-control mt-2"
//             placeholder="Title"
//             onChange={(e) => setTitle(e.target.value)}
//           />

//           <input
//             className="form-control mt-2"
//             placeholder="Category"
//             onChange={(e) => setCategory(e.target.value)}
//           />

//           <div className="mt-3">

//             <button className="btn btn-primary me-2" onClick={saveNote}>
//               Save
//             </button>

//             <button className="btn btn-secondary" onClick={close}>
//               Cancel
//             </button>

//           </div>

//         </div>

//       </div>

//     </div>

//   );
// }

// export default SaveModal;