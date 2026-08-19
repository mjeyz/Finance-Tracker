const transactionBtn = document.getElementById("transactionBtn");
const eventBtn = document.getElementById("eventBtn");
const savingBtn = document.getElementById("savingBtn");
const listContainer = document.getElementById("listContainer");
const dynamicTitle = document.getElementById("dynamicTitle");
const addBtn = document.getElementById("addTransaction");
const tabButton = document.querySelectorAll(".tab-btn");
const modalTitle = document.getElementById("modalTitle");
const viewMore = document.getElementById("viewMoreLink");

const listSection = {
    transactionList: document.getElementById("transactionList"),
    eventList: document.getElementById("eventList"),
    savingList: document.getElementById("savingList")
}

const searchInput = document.getElementById("dashboardSearch");

const entryForms = document.querySelectorAll(".entry-form");

const listItemSelectors = {
    transactionList: ".transaction-item",
    eventList: ".event-item",
    savingList: ".goal-card"
};

const formConfig = {
    transaction: {
        formId: "transactionForm",
        title: "Add Transaction",
        buttonText: "+ Add Transaction",
        pageLink: "/transaction"
    },
    event: {
        formId: "eventForm",
        title: "Add Event",
        buttonText: "+ Add Event",
        pageLink: "/event",
    },
    saving: {
        formId: "savingForm",
        title: "Add Saving Goal",
        buttonText: "+ Add Goal",
        pageLink: "/saving"
    }
};

let activeCategory = "transaction";
let searchQuery = "";

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

const links = {
    transactionPage: "/transaction",
    eventPage: "/events",
    savingPage: "/saving"
}

function formatEventDateParts(input) {
    const d = new Date(input);

    if (Number.isNaN(d.getTime())) {
        return null;
    }

    return {
        fullDateText: d.toDateString(),
        dayShort: d.toLocaleDateString("en-US", {weekday: "long"}),
        monthShort: d.toLocaleDateString("en-US", {month: "short"}),
        dateNum: d.getDate(),
        year: d.getFullYear(),
        timeText: d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        })
    };
}

function setActiveBtn(activeElementId) {
    const allBtn = [transactionBtn, eventBtn, savingBtn].filter(Boolean);

    allBtn.forEach((btn) => {
        btn.classList.toggle("active", btn.id === activeElementId);
    });
}

function showCategory(categoryType) {
    const targetId = categoryType + "List";
    const title = titles[targetId] || "Dashboard";
    const btnText = buttonTexts[targetId] || "+ Add";
    const linkId = categoryType + "Page";
    const pageLink = links[linkId];

    if (dynamicTitle) {
        dynamicTitle.textContent = title;
    }

    Object.keys(listSection).forEach((id) => {
        const list = listSection[id];
        if (list) {
            list.classList.toggle("active", id === targetId);
        }
    });

    if (addBtn) {
        addBtn.textContent = btnText;
    }

    if (pageLink && viewMore) {
        viewMore.href = pageLink;
    }

    applySearchFilter();
}

function setActiveForm(categoryType) {
    const config = formConfig[categoryType] || formConfig.transaction;

    activeCategory = categoryType in formConfig ? categoryType : "transaction";

    entryForms.forEach((form) => {
        form.classList.toggle("active", form.id === config.formId);
    });

    if (modalTitle) {
        modalTitle.textContent = config.title;
    }

    if (addBtn) {
        addBtn.textContent = config.buttonText;
    }
}

function applySearchFilter() {
    const activeListId = activeCategory + "List";
    const activeList = listSection[activeListId];

    if (!activeList) {
        return;
    }

    const query = searchQuery.trim().toLowerCase();
    const items = activeList.querySelectorAll(listItemSelectors[activeListId] || "");
    const serverEmptyMessage = activeList.querySelector(".empty-message:not(.search-empty-message)");
    const existingSearchEmptyMessage = activeList.querySelector(".search-empty-message");

    if (serverEmptyMessage) {
        serverEmptyMessage.style.display = query ? "none" : "flex";
    }

    if (!query) {
        items.forEach((item) => {
            item.style.display = "";
        });

        if (existingSearchEmptyMessage) {
            existingSearchEmptyMessage.remove();
        }

        return;
    }

    let visibleCount = 0;

    items.forEach((item) => {
        const isMatch = item.textContent.toLowerCase().includes(query);
        item.style.display = isMatch ? "" : "none";

        if (isMatch) {
            visibleCount += 1;
        }
    });

    if (existingSearchEmptyMessage) {
        existingSearchEmptyMessage.remove();
    }

    if (visibleCount === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "empty-message search-empty-message";
        emptyMessage.textContent = "No matching results";
        activeList.appendChild(emptyMessage);
    }
}

function handleTransactionClick() {
    setActiveForm("transaction");
    setActiveBtn("transactionBtn");
    showCategory("transaction");
}

function handleEventClick() {
    setActiveForm("event");
    setActiveBtn("eventBtn");
    showCategory("event");
}

function handleSavingClick() {
    setActiveForm("saving");
    setActiveBtn("savingBtn");
    showCategory("saving");
}

transactionBtn?.addEventListener("click", handleTransactionClick);
eventBtn?.addEventListener("click", handleEventClick);
savingBtn?.addEventListener("click", handleSavingClick);

searchInput?.addEventListener("input", function (event) {
    searchQuery = event.target.value || "";
    applySearchFilter();
});

setActiveBtn("transactionBtn");
showCategory("transaction");
setActiveForm("transaction");


const overlay = document.getElementById("overlay");
const model = document.getElementById("model");
const openBtn = document.getElementById("addTransaction");
const closeBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.querySelectorAll(".cancel-btn");


function openModel() {
    setActiveForm(activeCategory);
    if (overlay) {
        overlay.classList.add("active");
    }
    document.body.style.overflow = "hidden";
    if (model) {
        model.style.transform = "";
    }
}

function closeModel() {
    if (overlay) {
        overlay.classList.remove("active");
    }
    document.body.style.overflow = "";
}

openBtn?.addEventListener("click", openModel);
closeBtn?.addEventListener("click", closeModel);
cancelBtn.forEach((button) => button.addEventListener("click", closeModel));

overlay?.addEventListener("click", function (event) {
    if (event.target === overlay) {
        closeModel();
    }
});


entryForms.forEach((form) => {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const submitRoute = form.dataset.submitRoute;
        const formData = new FormData(form);

        const data = Object.fromEntries(formData.entries());
        data.category = activeCategory;

        const response = await fetch(submitRoute, {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: JSON.stringify(data),
        });

        if (response.ok) {
            closeModel();
            form.reset();
            window.location.reload();
            return;
        }

        const result = await response.json().catch(() => null);
        const message = result?.error || "Unable to save entry right now.";
        alert(message);
    });
});


// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function () {

    // Select ALL delete buttons using the class
    document.querySelectorAll('.delete').forEach(button => {

        button.addEventListener('click', async function (event) {
            // Find the parent transaction container
            const transactionItem = this.closest('.transaction-item');
            // Get the transaction ID from the data attribute
            const transactionId = transactionItem.dataset.id;

            // Optional: Ask for confirmation before deleting
            if (!confirm(`Are you sure you want to delete this transaction?`)) {
                return;
            }

            try {
                // Send the DELETE request from the BROWSER
                const response = await fetch(`/api/transactions?id=${transactionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                }

                // Success! Remove the transaction row from the UI without refreshing the page
                transactionItem.remove();
                console.log('Transaction deleted successfully');

            } catch (error) {
                console.error('Delete error:', error.message);
                alert('Could not delete transaction: ' + error.message);
            }
        });

    });

});

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".delete").forEach(button => {
        button.addEventListener("click", async function (event) {
            const eventItem = this.closest(".event-item");
            const transactionId = eventItem.dataset.id;
            if (!confirm(`Are you sure you want to delete this transaction?`)) {
                return;
            }
            try {
                const response = await fetch(`api/delete/event?id=${transactionId}`, {
                    method: "DELETE",
                    headers: {
                        "content-type": "application/json"
                    }
                });
                eventItem.remove();
            } catch (err) {
                console.log(err)
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".delete").forEach(button => {
        button.addEventListener("click", async function (event) {
            const goalItem = this.closest(".goal-card");
            const goalId = goalItem.dataset.id;
            if (!confirm(`Are you sure you want to delete this transaction?`)) {
                return;
            }
            try {
                const response = await fetch(`/api/delete/goal?id=${goalId}`, {
                    method: "DELETE",
                    headers: {
                        "content-type": "application/json"
                    }
                })
                goalItem.remove();
            } catch (err) {
                console.log(err);
            }
        });
    });
});

const updateIncomeBtn = document.getElementById("updateIncomeBtn");
const updateIncomeOverlay = document.getElementById("updateIncomeOverlay");
const incomeCancelModel = document.getElementById("incomeCancelModel");
const incomeCloseBtn = document.getElementById("incomeCloseBtn");
const incomeSubmitBtn = document.getElementById("incomeSubmitBtn");
const incomeForm = document.getElementById("incomeForm")


function closeIncomeModel() {
    updateIncomeOverlay.classList.remove("active")
}

function openIncomeModel() {
    updateIncomeOverlay.classList.add("active")
}

updateIncomeBtn?.addEventListener("click", openIncomeModel);
incomeCancelModel?.addEventListener("click", closeIncomeModel);
incomeCloseBtn?.addEventListener("click", closeIncomeModel);


incomeForm?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(incomeForm)
    const data = Object.fromEntries(formData.entries())

    try {
        const response = await fetch("/api/update/income", {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeIncomeModel();
            incomeForm.reset();
            window.location.reload();
            return;
        }
    } catch (err) {
        console.log(err)
    }
});


//TOGGLE LOGIC
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const sidebarOverlay = document.getElementById("sidebarOverlay");

function toggleSidebar() {
    if (!sidebar || !sidebarOverlay || !toggleBtn) {
        return;
    }

    const isOpen = sidebar.classList.toggle("open");
    sidebarOverlay.classList.toggle("active", isOpen);

    const icon = toggleBtn.querySelector("i");
    if (icon) {
        icon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    }
}

if (toggleBtn && sidebarOverlay) {
    toggleBtn.addEventListener("click", toggleSidebar);
    sidebarOverlay.addEventListener("click", toggleSidebar);
}

document.querySelectorAll(".sidebar-manu a, .logout-sidebar-btn a").forEach((item) => {
    item.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            toggleSidebar();
        }
    });
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        sidebar?.classList.remove("open");
        sidebarOverlay?.classList.remove("active");
        const icon = toggleBtn?.querySelector("i");
        if (icon) {
            icon.className = "fa-solid fa-bars";
        }
    }
});

document.querySelectorAll(".eye-icon").forEach((eyeIcon) => {
    const inputWrapper = eyeIcon.closest(".input-wrapper");
    const passwordField = inputWrapper?.querySelector("input");

    if (!passwordField) {
        return;
    }

    eyeIcon.addEventListener("click", function () {
        if (passwordField.type === "password") {
            passwordField.type = "text";
            eyeIcon.classList.remove("fa-eye");
            eyeIcon.classList.add("fa-eye-slash");
        } else {
            passwordField.type = "password";
            eyeIcon.classList.remove("fa-eye-slash");
            eyeIcon.classList.add("fa-eye");
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const eventCards = document.querySelectorAll(".upcoming-event-list .event");
    const transactionCards = document.querySelectorAll(".transaction-list .transaction-item");
    const eventListCards = document.querySelectorAll(".events-list .event-item");

    eventCards.forEach((card) => {
        const rawDate = card.dataset.eventDate || card.querySelector(".js-event-date")?.textContent;
        const parts = formatEventDateParts(rawDate);

        if (!parts) {
            return;
        }

        const dateEl = card.querySelector(".js-event-date");
        const dayEl = card.querySelector(".js-event-day");
        const timeEl = card.querySelector(".js-event-time");

        if (dateEl) {
            dateEl.textContent = parts.fullDateText;
        }

        if (dayEl) {
            dayEl.textContent = parts.dayShort;
        }

        if (timeEl) {
            timeEl.textContent = parts.timeText;
        }
    });

    transactionCards.forEach(list => {
        const transactionDate = document.querySelector(".transaction-date").textContent;
        const transactionPart = formatEventDateParts(transactionDate);

        const date = list.querySelector(".transaction-date");

        if (date) {
            date.textContent = transactionPart.fullDateText;
        }
    });

    eventListCards.forEach(card => {
        const eventDate = document.querySelector(".js-event-card-date").textContent;
        const eventPart = formatEventDateParts(eventDate)

        const dateEv = card.querySelector(".js-event-card-date")

        if (dateEv) {
            dateEv.textContent = eventPart.fullDateText;
        }

    });
});


// Graphs logic
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/api/transaction/charts");
        const data = await response.json();

        const graphResponse = await fetch("api/graph");
        const graphDate = await graphResponse.json();
        console.log(graphDate)

        const month = graphDate.map(item => item.month_label)
        const totalAmount = graphDate.map(item => item.total)
        // const formatedMonth = xLabel.map(data => formatEventDateParts(data).monthShort)
        const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        console.log(month)
        console.log(totalAmount)

        // xLabel.forEach(date => {
        //     const formatedDate = formatEventDateParts(date)
        //     const month = formatedDate.monthShort
        //     console.log(`Month for Graph ${month}`)
        // })


        const labels = data.map(item => item.category);
        const amounts = data.map(item => parseFloat(item.total_amount));

        const pieCanvas = document.getElementById("pieChart");
        const lineCanvas = document.getElementById("lineChart");
        if (!pieCanvas || !lineCanvas) return;

        const ctx = pieCanvas.getContext("2d");
        new Chart(ctx, {
            type: "pie",
            title: "Expense Breakdown by Category",
            data: {
                labels: labels,
                datasets: [{
                    label: "Total Amount ($)",
                    data: amounts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: "Expense Breakdown by Category",
                    fontSize: 18,
                    fontStyle: "bold",
                    fontColor: "#333",
                    padding: 10
                },
                legend: {
                    position: "top",
                },
            }
        });

        new Chart(lineCanvas.getContext("2d"), {
            type: "line",

            data: {
                labels: monthLabels,

                datasets: [{
                    label: "Monthly Expenses",

                    backgroundColor: "rgba(0, 0, 255, 0.2)",
                    borderColor: "rgba(0, 0, 255, 1)",

                    borderWidth: 2,
                    tension: 0.4,

                    data: amounts
                }]
            },

            options: {
                responsive: true,

                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error loading chart data: ", error);
    }
})


// Calendar logic
document.addEventListener("DOMContentLoaded", function () {
// Start with today's date as the current visible month
    const today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();


//DOM refs
    const daysGrid = document.getElementById("daysGrid");
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    const monthYearDisplay = document.getElementById("monthYearDisplay");

// Month names constant
    const MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const pad = n => String(n).padStart(2, "0");
    const dateKey = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

// Placeholder for event storage. Replace with real data-fetch when available.
    const EVENTS_BY_DATE = {}; // e.g. { '2026-08-08': [{type: 'green', title: 'Pay bill'}] }

    function getEventForDate(year, month, day) {
        const key = dateKey(year, month, day);
        const list = EVENTS_BY_DATE[key];
        return Array.isArray(list) ? list : [];
    }

    function renderCalendar(year, month) {
        if (!monthYearDisplay) return;
        monthYearDisplay.innerHTML = `${MONTH_NAMES[month]} <span>${year}</span>`;

        const firstDayOfWeek = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        let html = '';

        const prevYear = month === 0 ? year - 1 : year;
        const prevMonth = month === 0 ? 11 : month - 1;

        // Previous month's tail
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            html += buildDayCell(day, "other-month", getEventForDate(prevYear, prevMonth, day));
        }

        // Current month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = (year === today.getFullYear() && month === today.getMonth() && day === today.getDate());
            const cls = isToday ? "today" : "";
            html += buildDayCell(day, cls, getEventForDate(year, month, day));
        }

        // Next month's head to fill remaining cells
        const totalCells = firstDayOfWeek + daysInMonth;
        const remaining = (7 - (totalCells % 7)) % 7;
        const nextYear = month === 11 ? year + 1 : year;
        const nextMonth = month === 11 ? 0 : month + 1;
        for (let day = 1; day <= remaining; day++) {
            html += buildDayCell(day, 'other-month', getEventForDate(nextYear, nextMonth, day));
        }

        if (daysGrid) daysGrid.innerHTML = html;
    }


    function buildDayCell(day, className, events = []) {
        let indicatorsHtml = '';

        if (Array.isArray(events) && events.length > 0) {
            const maxDots = 3;
            const shown = events.slice(0, maxDots);
            const extra = events.length - maxDots;

            shown.forEach(ev => {
                indicatorsHtml += `<span class="indicator-dot ${ev.type}"></span>`;
            });

            if (extra > 0) {
                indicatorsHtml += `<span style="font-size: 9px; color: #7a7f8a;font-weight: 500;">+${extra}</span>`;
            }
        }

        return `
        <div class="day-cell ${className}">
            <span>${day}</span>
            ${indicatorsHtml ? `<div class="indicaters">${indicatorsHtml}</div>` : ''}
        </div>
    `;
    }


// Navigation helpers
    function goToPrevMonth() {
        currentMonth -= 1;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear -= 1;
        }
        renderCalendar(currentYear, currentMonth);
    }

    function goToNextMonth() {
        currentMonth += 1;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear += 1;
        }
        renderCalendar(currentYear, currentMonth);
    }

// Initial render and listeners
    renderCalendar(currentYear, currentMonth);

    if (prevMonthBtn) prevMonthBtn.addEventListener('click', goToPrevMonth);
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', goToNextMonth);

// Keyboard shortcuts (optional)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToPrevMonth();
        if (e.key === 'ArrowRight') goToNextMonth();
    });

    console.log('📅 Calendar ready!');
})