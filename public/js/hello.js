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


<label for="priority">Priority</label>

<select name="priority" id="priority">
    <option value="Low" <%= event.priority === "Low" ? "selected" : "" %>>
        Low
    </option>

    <option value="Medium" <%= event.priority === "Medium" ? "selected" : "" %>>
        Medium
    </option>

    <option value="High" <%= event.priority === "High" ? "selected" : "" %>>
        High
    </option>
</select>