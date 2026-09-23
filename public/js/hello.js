function basicAuth(req, res, next) {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Basic ")) {
        res.setHeader("WWW-Authenticate", 'Basic realm="API"');
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const base64Credentials = auth.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64")
        .toString("utf-8");

    const [username, password] = credentials.split(":");

    if (username === "admin" && password === "12345") {
        next();
    } else {
        res.setHeader("WWW-Authenticate", 'Basic realm="API"');
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }
}


app.get("/api/events", basicAuth, async (req, res) => {
    const result = await db.query("SELECT * FROM events");

    res.json(result.rows);
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


// Quiz section
