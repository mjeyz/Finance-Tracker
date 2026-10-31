(() => {
    const dismissDelay = 4500;

    function dismissFlash(message) {
        message.classList.add("flash-message-hide");
        window.setTimeout(() => message.remove(), 300);
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
        element.textContent = message;
        stack.appendChild(element);
        element.dataset.flashReady = "true";
        window.setTimeout(() => dismissFlash(element), dismissDelay);
    }

    function setupFlashMessages() {
        document.querySelectorAll(".flash-message").forEach((message) => {
            if (message.dataset.flashReady === "true") return;

            message.dataset.flashReady = "true";
            window.setTimeout(() => dismissFlash(message), dismissDelay);
        });
    }

    window.showFlashMessage = showFlash;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupFlashMessages, {once: true});
    } else {
        setupFlashMessages();
    }
})();
