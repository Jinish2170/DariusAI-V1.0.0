# DariusAI-V1.0.0

DariusAI-V1.0.0 is a ChatGPT-like conversational AI interface powered by the Gemini API. It allows users to interact with an AI assistant in natural language through an intuitive web-based chat interface.

## Features

- **Conversational AI Chat:** Engage in natural language conversations with an AI powered by the Gemini API.
- **Modern Frontend:** Responsive web interface built with JavaScript, HTML, and CSS.
- **Python Backend:** Handles API communication and chat logic.
- **Easy Setup:** Quick to install and configure.
- **Customizable:** Designed for easy extension and adaptation.

## Tech Stack

- **Frontend:** JavaScript, HTML, CSS
- **Backend:** Python
- **AI API:** Gemini API

## Getting Started

### Prerequisites

- Python 3.7+
- Node.js & npm/yarn
- Gemini API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jinish2170/DariusAI-V1.0.0.git
   cd DariusAI-V1.0.0
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   # Set your Gemini API credentials in the appropriate config file or environment variable
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   # or
   yarn install
   ```

4. **Run the Application:**
   - **Backend:**
     ```bash
     python app.py
     ```
   - **Frontend:**
     ```bash
     npm start
     # or
     yarn start
     ```

5. Open your browser and navigate to `http://localhost:3000` (or the configured port).

## Usage

- Start chatting with the AI interface.
- Conversations are powered by the Gemini API backend.
- You can modify prompts, UI, or backend logic for customization.

## Folder Structure

```
.
├── backend/      # Python backend with API logic
├── frontend/     # Web frontend (JavaScript, HTML, CSS)
├── tests/        # Test scripts
├── README.md
└── ...
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss your ideas.

## License

[MIT](LICENSE)
