import express from "express";
import fs from "fs/promises";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Serve HTML files from a specified directory (e.g., 'public')
app.use(express.static("public"));

// Example API endpoint
app.get("/api/process", async (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    });

    // Close the connection when the client disconnects
    req.on("close", () => res.end());

    // TODO: `prompt`
    await completion_stream(prompt, res);

    // const stream = await completion_stream(q);
    // await process_stream(stream, res);

    // const columnDefsMedalsIncluded = [
    //     { field: "athlete" },
    //     { field: "gold" },
    //     { field: "silver" },
    //     { field: "bronze" },
    //     { field: "total" },
    //     { field: "age" },
    //     { field: "country" },
    //     { field: "sport" },
    //     { field: "year" },
    //     { field: "date" },
    // ];

    // res.json(columnDefsMedalsIncluded);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

async function completion_stream(prompt, responseStream) {
    const [systemFile, userFile] = ["prompts/system_prompt.txt", "prompts/user_prompt.txt"];

    let [system_prompt, user_prompt] = await Promise.all([
        fs.readFile(systemFile, { encoding: "utf8" }),
        fs.readFile(userFile, { encoding: "utf8" }),
    ]);

    user_prompt = user_prompt.concat(prompt);

    const params = {
        messages: [
            {
                role: "system",
                content: system_prompt,
            },
            {
                role: "user",
                content: user_prompt,
            },
        ],
        model: "gpt-3.5-turbo-0125",
        max_tokens: 100,
        temperature: 0.2,
        stream: true,
    };

    console.log("Calling completion API: ", params);

    const stream = await openai.beta.chat.completions.stream(params);

    stream.on("connect", () => {
        console.log(`START`);
        responseStream.write("event: table_name\n");
    });

    stream.on("content", (delta, snapshot) => {
        const d = delta.replaceAll("\n", "^|NL|^");

        console.log(`content delta: ${d}`);

        responseStream.write("event: table_name\n");
        responseStream.write(`data: ${d}\n\n`);
    });

    // stream.on("finalContent", (contentSnapshot) => {
    //     console.log(`finalContent: ${contentSnapshot}`);
    // });

    // The event fired when an error is encountered outside of a parse function or an abort.
    stream.on("error", (error) => {
        console.error(error);
        responseStream.end();
    });

    // The event fired when the stream receives a signal to abort.
    stream.on("abort", (error) => {
        console.error(error);
        responseStream.end();
    });

    stream.on("end", () => {
        console.log("END");
        // responseStream.write("\n");
        responseStream.end();
    });
}
