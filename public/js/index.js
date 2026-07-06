// const TRANSACTIONS = [
//   {
//     id: 1,
//     description: "💼 Salary (Freelance)",
//     amount: 3450.75,
//     type: "income",
//   },
//   {
//     id: 2,
//     description: "🛒 Groceries & Supermarket",
//     amount: -128.4,
//     type: "expense",
//   },
//   {
//     id: 3,
//     description: "☕ Coffee & Workspace",
//     amount: -42.3,
//     type: "expense",
//   },
//   {
//     id: 4,
//     description: "📱 Phone & Internet Bill",
//     amount: -89.99,
//     type: "expense",
//   },
//   { id: 5, description: "🎁 Bonus & Cashback", amount: 120.0, type: "income" },
//   { id: 6, description: "🚗 Fuel & Transport", amount: -55.2, type: "expense" },
// ];
//
// const EVENTS = [
//   {
//     id: 1,
//     name: "🌟 Tech Conference 2025",
//     date: "May 22, 2025",
//     location: "Convention Hall",
//   },
//   {
//     id: 2,
//     name: "🎨 Design Workshop",
//     date: "June 10, 2025",
//     location: "Creative Hub",
//   },
//   {
//     id: 3,
//     name: "🏆 Team Hackathon",
//     date: "July 5, 2025",
//     location: "Innovation Lab",
//   },
//   {
//     id: 4,
//     name: "📚 Startup Networking Night",
//     date: "Aug 18, 2025",
//     location: "Downtown Loft",
//   },
// ];
//
// const SAVINGS = [
//   { id: 1, goal: "🌴 Dream Vacation", targetAmount: 4500, savedAmount: 1875 },
//   {
//     id: 2,
//     goal: "🚗 New Electric Car",
//     targetAmount: 32000,
//     savedAmount: 8900,
//   },
//   {
//     id: 3,
//     goal: "🏡 Home Down Payment",
//     targetAmount: 70000,
//     savedAmount: 15200,
//   },
//   { id: 4, goal: "📚 Education Fund", targetAmount: 12000, savedAmount: 6400 },
// ];

let TRANSACTIONS = window.__INITIAL_DATA__?.transactions || [];
let EVENTS = window.__INITIAL_DATA__?.events || [];
let SAVINGS = window.__INITIAL_DATA__?.savings || [];

const transactionBtn = document.getElementById("transactionBtn");
const eventBtn = document.getElementById("eventBtn");
const savingBtn = document.getElementById("savingBtn");
const listContainer = document.getElementById("listContainer");
const dynamicTitle = document.getElementById("dynamicTitle");
const addBtn = document.getElementById("addTransaction");
const transactionList = document.getElementById("transactionList");
const eventList = document.getElementById("eventList");
const savingList = document.getElementById("savingList");

function setActiveBtn(activeElementId) {
  const allBtn = [transactionBtn, eventBtn, savingBtn];

  allBtn.forEach((btn) => {
    if (btn.id === activeElementId) {
      btn.classList.add("active");

    } else {
      btn.classList.remove("active");
    }
  });
}

// function renderTransactionList() {
//   if (!TRANSACTIONS.length) {
//     return '<div class="empty-message">No Transaction found</div>';
//   }
//
//   let html = "";
//
//   for (let tx of TRANSACTIONS) {
//     html += `
//
// `;
//   }
//
//   return html;
// }

// function renderEventList() {
//   if (!EVENTS.length) {
//     return "<div class='empty-message'>No Upcoming Event</div>";
//   }
//
//   let html = "";
//
//   for (let ev of EVENTS) {
//     html += ` <div class="events-list">
//             <div class="event-item">
//                 <div style="flex: 1; min-width: 0; border-left: 5px solid orangered; border-radius: 4px; padding-left: 10px">
//                     <p style="margin: 0; font-size: 14px;font-weight: 500; color: #3B3B3B">${ev.name}</p>
//                     <span style="font-size: 12px; color: #888;">${ev.date}</span>
//                 </div>
//                 <div style="white-space: nowrap;">
//                     <span style="font-size: 14px; font-weight: 500; color: orange">RS 400</span>
//                     <p style="font-size: 12px;">Mid priority</p>
//                 </div>
//             </div>
//         </div>`;
//   }
//
//   return html;
// }

// function renderSavingList() {
//   if (!SAVINGS.length) {
//     return "<div class='empty-message'>No saving found</div>";
//   }
//
//   let html = "";
//
//   for (let sv of SAVINGS) {
//     const percent = (sv.savedAmount / sv.targetAmount) * 100;
//     const percentRounded = Math.min(100, Math.floor(percent));
//     html += `
//         <div class="saving-goals">
//             <div class="goal-card">
//                 <div class="goal-header">
//                     <span class="goal-name">${sv.goal}</span>
//                     <span class="goal-pct">${percentRounded}%</span>
//                 </div>
//                 <div class="progress-track">
//                     <div class="progress-fill" style="width: ${percentRounded}%"></div>
//                 </div>
//                 <div class="goal-footer">
//                     <span>Rs ${sv.savedAmount} saved</span>
//                     <span>Goal: Rs ${sv.targetAmount}</span>
//                 </div>
//             </div>
//         </div>
// `;
//   }

//   return html;
// }

function renderSavingList() {

}


function showCategory(categoryType) {
  let contentHtml = "";
  let titleText = "";
  let addBtnText = "";

  switch (categoryType) {
    case "transaction":
      contentHtml = renderTransactionList();
      titleText = "Transaction records";
      addBtnText = "+ Add Transaction";
      break;
    case "event":
      contentHtml = renderEventList();
      titleText = "Upcoming Event";
      addBtnText = "+ Add Event";
      break;
    case "saving":
      contentHtml = renderSavingList();
      titleText = "Saving Goal";
      addBtnText = "+ Add Goal";
      break;
    default:
      contentHtml =
        "<div class='empty-message'>Select a category to see details</div>";
      titleText = "Dashboard";
  }

  dynamicTitle.innerText = titleText;
  listContainer.innerHTML = contentHtml;
  if (addBtn) {
    addBtn.innerText = addBtnText;
  }
}

function handleTransactionClick() {
  setActiveBtn("transactionBtn");
  showCategory("transaction");
}

function handleEventClick() {
  setActiveBtn("eventBtn");
  showCategory("event");
}

function handleSavingClick() {
  setActiveBtn("savingBtn");
  showCategory("saving");
}
transactionBtn.addEventListener("click", handleTransactionClick);
eventBtn.addEventListener("click", handleEventClick);
savingBtn.addEventListener("click", handleSavingClick);

setActiveBtn("transactionBtn");
showCategory("transaction");




const overlay = document.getElementById("overlay");
const model = document.getElementById("model");
const modelHeader = document.getElementById("modelHeader");
const openBtn = document.getElementById("addTransaction");
const closeBtn = document.getElementById("closeModalBtn");
const form = document.getElementById("entryForm");
const cancelBtn = document.getElementById("cancelBtn");


function openModel() {
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
  model.style.transform = "";
}

function closeModel() {
  overlay.classList.remove("active");
  document.body.style.overflow = "";
}

openBtn.addEventListener("click", openModel);
closeBtn.addEventListener("click", closeModel);
cancelBtn.addEventListener("click", closeModel);





















    //
    //
    //
    //
    //
    //
    //
    //
    //
    // (function () {
    //     'use strict';
    //
    //     // ── DOM refs ──
    //     const overlay = document.getElementById('overlay');
    //     const modal = document.getElementById('modal');
    //     const modalHeader = document.getElementById('modalHeader');
    //     const openBtn = document.getElementById('addTransaction');
    //     const closeBtn = document.getElementById('closeModalBtn');
    //     const cancelBtn = document.getElementById('cancelBtn');
    //     const form = document.getElementById('entryForm');
    //
    //     // ── Open / Close ──
    //     function openModal() {
    //         overlay.classList.add('active');
    //         document.body.style.overflow = 'hidden'; // prevent scroll
    //         // Reset any lingering drag transforms
    //         modal.style.transform = '';
    //     }
    //
    //     function closeModal() {
    //         overlay.classList.remove('active');
    //         document.body.style.overflow = '';
    //         // Reset form (optional)
    //         // form.reset();
    //     }
    //
    //     // ── Event listeners for open/close ──
    //     openBtn.addEventListener('click', openModal);
    //     closeBtn.addEventListener('click', closeModal);
    //     cancelBtn.addEventListener('click', closeModal);
    //
    //     // Click on overlay background closes modal (but not if click inside modal)
    //     overlay.addEventListener('click', function (e) {
    //         if (e.target === overlay) {
    //             closeModal();
    //         }
    //     });
    //
    //     // ESC key closes
    //     document.addEventListener('keydown', function (e) {
    //         if (e.key === 'Escape' && overlay.classList.contains('active')) {
    //             closeModal();
    //         }
    //     });
    //
    //     // ── DRAG LOGIC ──
    //     let isDragging = false;
    //     let offsetX = 0;
    //     let offsetY = 0;
    //     let startX = 0;
    //     let startY = 0;
    //
    //     // We'll store the modal's current position as transform values
    //     let currentX = 0;
    //     let currentY = 0;
    //
    //     modalHeader.addEventListener('mousedown', function (e) {
    //         // Only left-click
    //         if (e.button !== 0) return;
    //
    //         // Don't start drag if the click is on the close button or its children
    //         const target = e.target.closest('.close-btn');
    //         if (target) return;
    //
    //         isDragging = true;
    //         modal.classList.add('dragging');
    //
    //         // Get the current transform values (if any)
    //         const style = window.getComputedStyle(modal);
    //         const transform = style.transform;
    //         if (transform && transform !== 'none') {
    //             const matrix = transform.match(/matrix.*\((.+)\)/);
    //             if (matrix) {
    //                 const values = matrix[1].split(', ').map(Number);
    //                 // matrix(scaleX, skewY, skewX, scaleY, tx, ty)
    //                 currentX = values[4] || 0;
    //                 currentY = values[5] || 0;
    //             }
    //         }
    //
    //         // Mouse position relative to the modal
    //         const rect = modal.getBoundingClientRect();
    //         offsetX = e.clientX - rect.left;
    //         offsetY = e.clientY - rect.top;
    //
    //         // Store starting mouse position for calculating delta
    //         startX = e.clientX;
    //         startY = e.clientY;
    //
    //         // Prevent text selection while dragging
    //         document.body.style.userSelect = 'none';
    //
    //         e.preventDefault();
    //     });
    //
    //     document.addEventListener('mousemove', function (e) {
    //         if (!isDragging) return;
    //
    //         const deltaX = e.clientX - startX;
    //         const deltaY = e.clientY - startY;
    //
    //         // Apply the new position
    //         const newX = currentX + deltaX;
    //         const newY = currentY + deltaY;
    //
    //         modal.style.transform = `translate(${newX}px, ${newY}px)`;
    //
    //         // Keep the modal within viewport (optional but nice)
    //         // We'll just let it go anywhere for simplicity
    //     });
    //
    //     document.addEventListener('mouseup', function (e) {
    //         if (isDragging) {
    //             isDragging = false;
    //             modal.classList.remove('dragging');
    //             document.body.style.userSelect = '';
    //
    //             // Update currentX/Y to match the final transform
    //             const style = window.getComputedStyle(modal);
    //             const transform = style.transform;
    //             if (transform && transform !== 'none') {
    //                 const matrix = transform.match(/matrix.*\((.+)\)/);
    //                 if (matrix) {
    //                     const values = matrix[1].split(', ').map(Number);
    //                     currentX = values[4] || 0;
    //                     currentY = values[5] || 0;
    //                 }
    //             } else {
    //                 currentX = 0;
    //                 currentY = 0;
    //             }
    //         }
    //     });
    //
    //     // ── Handle form submission ──
    //     form.addEventListener('submit', function (e) {
    //         e.preventDefault();
    //
    //         const title = document.getElementById('title').value.trim();
    //         if (!title) {
    //             alert('Please enter a title.');
    //             return;
    //         }
    //
    //         // Collect data
    //         const data = {
    //             title: title,
    //             category: document.getElementById('category').value,
    //             status: document.getElementById('status').value,
    //             description: document.getElementById('description').value.trim(),
    //         };
    //
    //         console.log('📦 Form submitted:', data);
    //
    //         // Show a quick success feedback
    //         const btn = form.querySelector('.btn-primary');
    //         const originalText = btn.innerHTML;
    //         btn.innerHTML = '<i class="fas fa-check-circle"></i> Done!';
    //         btn.style.background = '#27ae60';
    //         btn.style.boxShadow = '0 6px 20px rgba(39, 174, 96, 0.3)';
    //
    //         setTimeout(() => {
    //             btn.innerHTML = originalText;
    //             btn.style.background = '';
    //             btn.style.boxShadow = '';
    //             closeModal();
    //             form.reset();
    //             // Reset drag position (optional – return modal to center)
    //             modal.style.transform = '';
    //             currentX = 0;
    //             currentY = 0;
    //         }, 800);
    //     });
    //
    //     // ── Reset modal position when closed ──
    //     // We want the modal to re-center when opened again.
    //     // We'll store the original transform and reset on open.
    //     const originalTransform = modal.style.transform;
    //
    //     // Override openModal to reset position
    //     const originalOpen = openModal;
    //     openModal = function () {
    //         // Reset transform to center
    //         modal.style.transform = '';
    //         currentX = 0;
    //         currentY = 0;
    //         originalOpen.call(this);
    //     };
    //
    //     // Re-bind the open button
    //     openBtn.removeEventListener('click', openModal);
    //     openBtn.addEventListener('click', openModal);
    //
    //     console.log('✅ Draggable modal ready! Drag the header to move it.');
    // })();
