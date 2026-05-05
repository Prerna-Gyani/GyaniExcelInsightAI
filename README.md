This project is created by Prerna Gyanchandani.

# DataMind AI - Intelligent Data Analyst

DataMind AI is a powerful, local-first AI chatbot designed to help you analyze Excel and CSV files using Google's Gemini models. Upload your datasets, select which ones you want to analyze, and start a conversation to gain deep insights instantly.

## 🚀 Features

- **Multi-File Support**: Upload and manage multiple CSV and Excel (.xlsx, .xls) files simultaneously.
- **Context-Aware Analysis**: Select specific datasets to provide context for the AI analyst.
- **Natural Language Chat**: Ask complex questions about your data, request summaries, or identify trends using natural language.
- **Raw Data Explorer**: Inspect your uploaded data in a clean, searchable table view.
- **Privacy Focused**: Your Gemini API key is stored only in your local browser storage, and file analysis happens in-session without persistent server storage of your raw data.
- **Beautiful UI**: Modern, responsive interface built with Tailwind CSS and Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion (motion/react)
- **AI Engine**: Google Gemini (via `@google/genai`)
- **Data Parsing**: XLSX (SheetJS), PapaParse
- **Icons**: Lucide React

## 📖 How to Use

1. **Configure API**: Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and enter it in the setup modal.
2. **Upload Data**: Click the **"+"** icon in the sidebar or the **"New Analysis"** button to upload your CSV or Excel files.
3. **Select Datasets**: Use the checkboxes in the sidebar to toggle which files should be included in the AI's context.
4. **Chat & Analyze**: 
   - Use the **Chat Analysis** tab to ask questions.
   - Use the **Data Explorer** tab to view raw data rows.
5. **New Chat**: Click **"New Chat"** to clear the conversation history and start fresh.

## 📝 Example Prompts

- *"Summarize the key trends in this dataset."*
- *"What is the average of Column X across all entries?"*
- *"Compare the performance of Category A vs Category B."*
- *"Identify any anomalies or outliers in the data."*
- *"List the top 5 records by [Column Name]."*

## 🔒 Security & Privacy

- **Local Storage**: Your API key is stored locally in your browser (`localStorage`).
- **Data Transmission**: Only a relevant sample of your data is sent to the Gemini API during chat sessions to provide context for your questions.
- **No Backend Storage**: This application does not store your files on any server. Analysis is done purely based on the uploaded session data.


Thankyou for visiting.

You can visit for more projects: www.github.com/prerna-gyani

Know More: www.linkedin.com/in/prerna-gyani
