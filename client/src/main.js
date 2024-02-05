import { SSE } from "sse.js";

let api;
const button_process = document.getElementById("button_process");
button_process.addEventListener("click", process);

document.addEventListener("DOMContentLoaded", () => {
    const gridOptions = {
        // Row Data: The data to be displayed.
        rowData: [],
        // Column Definitions: Defines & controls grid columns.
        columnDefs: [],
    };

    const gridDiv = document.querySelector("#myGrid");
    api = agGrid.createGrid(gridDiv, gridOptions);
});

function process() {
    const table_header = document.getElementById("table_name");
    table_header.innerHTML = "Thinking...";

    const prompt = document.getElementById("ta_prompt").value;
    const payload = JSON.stringify({ prompt: prompt });
    console.log(`payload: ${payload}`);

    var subscription = new SSE("http://localhost:3002/api/process", {
        headers: { "Content-Type": "application/json" },
        payload: payload,
    });

    const table_name_chunks = [];
    subscription.addEventListener("table_name", (event) => {
        // console.log(`table name: ${event.data}`);

        const chunk = event.data.replaceAll("^|NL|^", "\n");
        table_name_chunks.push(chunk);

        table_header.innerHTML = table_name_chunks.join("");
    });

    const table_fields_chunks = [];
    let last_chunk = "";
    subscription.addEventListener("table_fields", (event) => {
        // console.log(`table fields: ${event.data}`);

        if (event.data === "^|NL|^") {
            table_fields_chunks.push(last_chunk);
            last_chunk = "";

            const columnDefs = table_fields_chunks.map((val) => ({
                field: val,
                headerName: val,
            }));
            // console.log(columnDefs);
            api.setGridOption("columnDefs", columnDefs);
        } else {
            last_chunk += event.data;
        }
    });

    subscription.addEventListener("error", () => {
        console.error("Subscription err'd");
        subscription.close();
    });
}
