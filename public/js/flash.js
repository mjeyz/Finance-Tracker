(() => {
    const dismissDelay = 4500;

    function dismissFlash(message) {
        if (!message || message.classList.contains("flash-message-hide")) return;
        message.classList.add("flash-message-hide");
        window.setTimeout(() => message.remove(), 300);
    }

    function addCloseButton(message) {
        if (message.querySelector(".flash-close")) return;

        const closeButton = document.createElement("button");
        closeButton.className = "flash-close";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Dismiss message");
        closeButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
        message.appendChild(closeButton);
    }

    function showFlash(message, type = "info") {
        let stack = document.querySelector(".page-flash-stack");

        if (!stack) {
            stack = document.createElement("div");
            stack.className = "flash-stack page-flash-stack";
            stack.setAttribute("aria-live", "polite");
            stack.setAttribute("aria-atomic", "true");
            document.body.appendChild(stack);
        }

        const element = document.createElement("div");
        element.className = `flash-message flash-${type}`;
        element.setAttribute("role", "alert");
        element.textContent = message;
        addCloseButton(element);
        stack.appendChild(element);
        element.dataset.flashReady = "true";
        window.setTimeout(() => dismissFlash(element), dismissDelay);
    }

    function setupFlashMessages() {
        document.querySelectorAll(".flash-message").forEach((message) => {
            if (message.dataset.flashReady === "true") return;

            message.dataset.flashReady = "true";
            addCloseButton(message);
            window.setTimeout(() => dismissFlash(message), dismissDelay);
        });

        document.addEventListener("click", (event) => {
            const closeButton = event.target.closest(".flash-close");
            if (closeButton) {
                dismissFlash(closeButton.closest(".flash-message"));
            }
        });
    }

    window.showFlashMessage = showFlash;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupFlashMessages, {once: true});
    } else {
        setupFlashMessages();
    }
})();
