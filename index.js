const TRANSACTIONS = [
  {
    id: 1,
    description: "💼 Salary (Freelance)",
    amount: 3450.75,
    type: "income",
  },
  {
    id: 2,
    description: "🛒 Groceries & Supermarket",
    amount: -128.4,
    type: "expense",
  },
  {
    id: 3,
    description: "☕ Coffee & Workspace",
    amount: -42.3,
    type: "expense",
  },
  {
    id: 4,
    description: "📱 Phone & Internet Bill",
    amount: -89.99,
    type: "expense",
  },
  { id: 5, description: "🎁 Bonus & Cashback", amount: 120.0, type: "income" },
  { id: 6, description: "🚗 Fuel & Transport", amount: -55.2, type: "expense" },
];

const EVENTS = [
  {
    id: 1,
    name: "🌟 Tech Conference 2025",
    date: "May 22, 2025",
    location: "Convention Hall",
  },
  {
    id: 2,
    name: "🎨 Design Workshop",
    date: "June 10, 2025",
    location: "Creative Hub",
  },
  {
    id: 3,
    name: "🏆 Team Hackathon",
    date: "July 5, 2025",
    location: "Innovation Lab",
  },
  {
    id: 4,
    name: "📚 Startup Networking Night",
    date: "Aug 18, 2025",
    location: "Downtown Loft",
  },
];

const SAVINGS = [
  { id: 1, goal: "🌴 Dream Vacation", targetAmount: 4500, savedAmount: 1875 },
  {
    id: 2,
    goal: "🚗 New Electric Car",
    targetAmount: 32000,
    savedAmount: 8900,
  },
  {
    id: 3,
    goal: "🏡 Home Down Payment",
    targetAmount: 70000,
    savedAmount: 15200,
  },
  { id: 4, goal: "📚 Education Fund", targetAmount: 12000, savedAmount: 6400 },
];

const transactionBtn = document.getElementById("transactionBtn");
const eventBtn = document.getElementById("eventBtn");
const savingBtn = document.getElementById("savingBtn");
const listContainer = document.getElementById("listContainer");
const dynamicTitle = document.getElementById("dynamicTitle");
const addBtn = document.getElementById("addBtn");

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

function renderTransactionList() {
  if (!TRANSACTIONS.length) {
    return '<div class="empty-message">No Transaction found</div>';
  }

  let html = "";

  for (let tx of TRANSACTIONS) {
    html += `
         <div class="transaction-item">
             <div style="width: 42px; height: 42px; background: #E0E7FF; border-radius: 20%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                             fill="#9b1212" viewBox="0 0 24 24">
                   <path d="M13 18v-6h4l-5-6-5 6h4v6z"></path>
                </svg>
                 </div>
                    <div style="flex: 1; min-width: 0;">
                        <p style="margin: 0; font-size: 14px; font-weight: 500; color: #3B3B3B;">${tx.description}</p>
                        <span style="font-size: 12px; color: #888;">2026-05-18</span>
                    </div>

                 <!-- 3. Amount -->
                 <span style="white-space: nowrap; color: #c0786a; font-size: 14px; font-weight: 500;">${tx.amount}</span>
             </div>
`;
  }

  return html;
}

function renderEventList() {
  if (!EVENTS.length) {
    return "<div class='empty-message'>No Upcoming Event</div>";
  }

  let html = "";

  for (let ev of EVENTS) {
    html += ` <div class="events-list">
            <div class="event-item">
                <div style="flex: 1; min-width: 0; border-left: 5px solid orangered; border-radius: 4px; padding-left: 10px">
                    <p style="margin: 0; font-size: 14px;font-weight: 500; color: #3B3B3B">${ev.name}</p>
                    <span style="font-size: 12px; color: #888;">${ev.date}</span>
                </div>
                <div style="white-space: nowrap;">
                    <span style="font-size: 14px; font-weight: 500; color: orange">RS 400</span>
                    <p style="font-size: 12px;">Mid priority</p>
                </div>
            </div>
        </div>`;
  }

  return html;
}

function renderSavingList() {
  if (!SAVINGS.length) {
    return "<div class='empty-message'>No saving found</div>";
  }

  let html = "";

  for (let sv of SAVINGS) {
    const percent = (sv.savedAmount / sv.targetAmount) * 100;
    const percentRounded = Math.min(100, Math.floor(percent));
    html += `
        <div class="saving-goals">
            <div class="goal-card">
                <div class="goal-header">
                    <span class="goal-name">${sv.goal}</span>
                    <span class="goal-pct">${percentRounded}%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${percentRounded}%"></div>
                </div>
                <div class="goal-footer">
                    <span>Rs ${sv.savedAmount} saved</span>
                    <span>Goal: Rs ${sv.targetAmount}</span>
                </div>
            </div>
        </div>
`;
  }

  return html;
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
  addBtn.innerText = addBtnText;
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
