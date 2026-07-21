const transactionBtn = document.getElementById("transactionBtn");
const eventBtn = document.getElementById("eventBtn");
const savingBtn = document.getElementById("savingBtn");
const listContainer = document.getElementById("listContainer");
const dynamicTitle = document.getElementById("dynamicTitle");
const addBtn = document.getElementById("addTransaction");
const tabButton = document.querySelectorAll(".tab-btn");
const modalTitle = document.getElementById("modalTitle");

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
        buttonText: "+ Add Transaction"
    },
    event: {
        formId: "eventForm",
        title: "Add Event",
        buttonText: "+ Add Event"
    },
    saving: {
        formId: "savingForm",
        title: "Add Saving Goal",
        buttonText: "+ Add Goal"
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
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    model.style.transform = "";
}

function closeModel() {
    overlay.classList.remove("active");
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

updateIncomeBtn.addEventListener("click", openIncomeModel);
incomeCancelModel.addEventListener("click", closeIncomeModel);
incomeCloseBtn.addEventListener("click", closeIncomeModel);


incomeForm.addEventListener("submit", async function (event) {
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
    sidebar.classList.toggle("open");
    sidebarOverlay.classList.add("active");

    const icon = toggleBtn.querySelector('i')
    if (sidebar.classList.contains("open")) {
        icon.className = "fas fas-times";
    } else {
        icon.className = "fa-solid fa-xmark";
        sidebarOverlay.classList.remove("active");
    }
}

toggleBtn.addEventListener("click", toggleSidebar);
sidebarOverlay.addEventListener("click", toggleSidebar);

document.querySelectorAll(".sidebar-menu a").forEach(item => {
    item.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            toggleSidebar();
        }
    });
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");
        toggleBtn.querySelector("i").className = 'fas fa-bars';
    }
});

const passwordField = document.getElementById("password");
const eyeIcon = document.getElementById("eyeIcon");

alert("Hello")

eyeIcon.addEventListener("click", function () {
    if (passwordField.type === "password") {
        passwordField.type = "text";
    } else {
        passwordField.type = "password";
    }
});
