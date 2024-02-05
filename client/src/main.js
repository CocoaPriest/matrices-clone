import { SSE } from "sse.js";

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
    const api = agGrid.createGrid(gridDiv, gridOptions);

    // subscription.addEventListener("message", (event) => {
    //     console.log(`Receive message: ${event.data}`);
    //     console.log(`ID: ${event.lastEventId}`);
    // });

    // fetch("/api/get_columns")
    //     .then((response) => response.json())
    //     .then((data) => {
    //         // console.log(data);
    //         // api.setGridOption("rowData", data);
    //         api.setGridOption("columnDefs", data);
    //     });
});

function process() {
    const table_header = document.getElementById("table_name");
    table_header.innerHTML = "Thinking...";

    const prompt = document.getElementById("ta_prompt").value;
    const payload = JSON.stringify({ prompt: prompt });
    console.log(payload);
    // debugger;

    var subscription = new SSE("http://localhost:3002/api/process", {
        headers: { "Content-Type": "application/json" },
        payload: payload,
    });

    const table_name_chunks = [];
    subscription.addEventListener("table_name", (event) => {
        console.log(event.data);

        const chunk = event.data.replaceAll("^|NL|^", "\n");
        table_name_chunks.push(chunk);

        table_header.innerHTML = table_name_chunks.join("");
    });

    subscription.addEventListener("current-date", (event) => {
        console.log(`current-date: ${event.data}`);
    });

    subscription.addEventListener("error", () => {
        console.error("Subscription err'd");
        subscription.close();
    });
}
