const transactionBtn = document.getElementById("transactionBtn");
const eventBtn = document.getElementById("eventBtn");
const savingBtn = document.getElementById("savingBtn");
const listContainer = document.getElementById("listContainer");
const dynamicTitle = document.getElementById("dynamicTitle");
const addBtn = document.getElementById("addTransaction");
const tabButton = document.querySelectorAll(".tab-btn");

const listSection = {
    transactionList: document.getElementById("transactionList"),
    eventList: document.getElementById("eventList"),
    savingList: document.getElementById("savingList")
}

const titles = {
    transactionList: "Transaction History",
    eventList: "Upcoming Events",
    savingList: "Savings Goals"
};

const buttonTexts = {
    transactionList: "+ Add Transaction",
    eventList: "+ Add Event",
    savingList: "+ Add Goal"
};


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

function showCategory(categoryType) {
    const targetId = categoryType + "List";
    const title = titles[targetId] || "Dashboard";
    const btnText = buttonTexts[targetId] || "+ Add";


    dynamicTitle.textContent = title;

    Object.keys(listSection).forEach(id => {
        listSection[id].classList.toggle("active", id === targetId)
    });

    if (addBtn) {
        addBtn.textContent = btnText;
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

transactionBtn?.addEventListener("click", handleTransactionClick);
eventBtn?.addEventListener("click", handleEventClick);
savingBtn?.addEventListener("click", handleSavingClick);

setActiveBtn("transactionBtn");
showCategory("transaction");


const overlay = document.getElementById("overlay");
const model = document.getElementById("model");
const openBtn = document.getElementById("addTransaction");
const closeBtn = document.getElementById("closeModalBtn");
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
