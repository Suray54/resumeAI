# ResumeAI Local Setup

Follow these steps to run the project on your local machine.

## Prerequisites

- **Node.js**: Version 20 or higher is recommended.
- **npm**: Usually comes with Node.js.

## Setup Instructions

1.  **Extract the ZIP file**: Unzip the downloaded project into a folder.
2.  **Install Dependencies**:
    Open your terminal in the project folder and run:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```
    You can get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The app should be available at `http://localhost:3000`.

## Troubleshooting

### `ERR_INVALID_URL_SCHEME` Error
If you encounter the `TypeError [ERR_INVALID_URL_SCHEME]` when running `npm run dev`, it is often due to an issue with `tsx` and absolute paths on some systems. 

Try updating your `dev` script in `package.json` to:
```json
"dev": "node --import tsx server.ts"
```
Or simply run:
```bash
npx tsx server.ts
```

### PDF Generation Issues
The PDF generation uses `modern-screenshot` and `jspdf`. Ensure your browser is up to date for the best results.
# resumeAI
