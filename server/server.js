import express from "express";
import cors from "cors";
import fs from "fs/promises";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/api/process", async (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    });

    // Close the connection when the client disconnects
    // req.on("close", () => res.end());

    const prompt = req.body.prompt;
    console.log(`=> prompt: ${prompt}`);

    await Promise.all([await table_name_stream(prompt, res), await table_fields_stream(prompt, res)]);
});

app.listen(PORT, () => {
    console.log("============================================================");
    console.log(`===> Server is running on http://localhost:${PORT}`);
});

async function table_name_stream(prompt, responseStream) {
    const [systemFile, userFile] = ["prompts/table_name_sys.txt", "prompts/table_name_usr.txt"];

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

    console.log("=> Calling table name api: ", params);

    const stream = openai.beta.chat.completions.stream(params);

    stream.on("connect", () => {
        console.log("=> Connect");
        // responseStream.write("event: table_name\n");
    });

    stream.on("content", (delta, snapshot) => {
        const d = delta.replaceAll("\n", "^|NL|^");

        console.log(`Δ table: ${d}`);

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
        console.log("=> Stream end");
        // responseStream.write("\n");
        // responseStream.end();
    });
}

async function table_fields_stream(prompt, responseStream) {
    const [systemFile, userFile] = ["prompts/table_fields_sys.txt", "prompts/table_fields_usr.txt"];

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
        max_tokens: 500,
        temperature: 0.2,
        stream: true,
    };

    console.log("=> Calling table fields api: ", params);

    const stream = openai.beta.chat.completions.stream(params);

    stream.on("connect", () => {
        console.log("=> Connect");
        // responseStream.write("event: table_fields\n");
    });

    stream.on("content", (delta, snapshot) => {
        const d = delta.replaceAll("\n", "^|NL|^");

        console.log(`Δ fields: ${d}`);

        responseStream.write("event: table_fields\n");
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
        console.log("=> Stream end");

        responseStream.write("event: table_fields\n");
        responseStream.write("data: ^|NL|^\n\n");
    });
}
