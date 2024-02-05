# Matrices App Clone

This project is a full-stack application designed to replicate the functionality of [Matrices.app](https://matrices.app), "The spreadsheet that fills itself". It's an excellent tool for anyone looking to quickly generate structured data from natural language inputs.

## Features

-   **AI-Powered Data Generation**: Utilizes OpenAI's GPT-3.5 to interpret user prompts and generate relevant table names and fields.
-   **Real-Time Data Streaming**: Streams AI-generated data to the client in real-time using Server-Sent Events (SSE), providing an interactive and responsive user experience.
-   **Dynamic Table Rendering**: Dynamically renders tables on the web page based on the AI-generated output, allowing for immediate visualization and editing of the data.

## Stack

-   **Frontend**: Vanilla JavaScript, HTML, CSS, Vite for bundling, and AG-Grid for dynamic table rendering.
-   **Backend**: Node.js with Express for the server and OpenAI API for data generation.

## Getting Started

### Prerequisites

-   Node.js installed on your machine.
-   An OpenAI API key.

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/CocoaPriest/matrices-clone.git
```

2. **Install dependencies**

Navigate to both the server and client directories in separate terminal windows and run:

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root of the server directory and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Application

1. **Start the server**

In the server directory, run:

```bash
npm run dev
```

This will start the backend server on `http://localhost:3002`.

2. **Start the client**

In the client directory, run:

```bash
npm run dev
```

This will start the frontend development server, typically on `http://localhost:3000`. Open your browser to this URL to interact with the application.

## Usage

1. **Enter a Prompt**: In the provided text area on the webpage, enter a natural language prompt describing the data table you wish to generate.
2. **Process**: Click the "Process" button to send the prompt to the server, which then interacts with the OpenAI API to generate table names and fields based on your input.
3. **View Results**: The application will dynamically render a table based on the AI's response, allowing you to view and edit the generated data.

## TODO

1. Detect what data is needed (using prompts)
2. Do a google search & scrape data
3. Do RAG ✨✨
4. Fill the table

## Contributing

Contributions are welcome! Please feel free to submit a pull request or create an issue if you have any suggestions, improvements, or find any bugs.

## License

This project is open-sourced under the MIT License. See the LICENSE file for more details.
