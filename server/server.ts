import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";

// GitHub Webhook Endpoint
app.post("/github", async (req: Request, res: Response) => {
    const eventType = req.headers["x-github-event"] as string;
    const payload = req.body;

    let message: string = "";

    if (eventType === "push") {
        const commits = payload.commits.map(
            (commit: { message: string; author: { name: string } }) =>
                `• ${commit.message} by ${commit.author.name}`
        ).join("\n");
        message = `🚀 *New Push to ${payload.repository.name}*\n${commits}`;
    } 
    else if (eventType === "pull_request") {
        message = `🔗 *New Pull Request*: ${payload.pull_request.title} by ${payload.pull_request.user.login}\n${payload.pull_request.html_url}`;
    } 
    else if (eventType === "issues") {
        message = `🐛 *New Issue*: ${payload.issue.title} by ${payload.issue.user.login}\n${payload.issue.html_url}`;
    } 
    else {
        message = `📢 Received ${eventType} event from GitHub`;
    }

    // Send message to Slack
    try {
        await axios.post(SLACK_WEBHOOK_URL, { text: message });
        res.status(200).json({ status: "Message sent to Slack!" });
    } catch (error) {
        console.error("Error sending to Slack:", error);
        res.status(500).json({ error: "Failed to send message to Slack" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
