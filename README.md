# Facial Recognition System for Surgery Outcome Comparison

## Project Overview
This project is a facial recognition system designed to compare before and after surgery images. It leverages machine learning and computer vision techniques to analyze facial features and provide objective assessments of surgical outcomes.

## Features
- Upload and compare pre- and post-surgery facial images
- Automated facial feature extraction and comparison
- User-friendly web interface
- Secure backend API
- Scalable and modular architecture

## System Architecture
- **Frontend:** React with TypeScript (located in `src/`)
- **Backend:** Flask (Python) REST API (located in `backend/`)
- **Model Training:** Jupyter Notebook (not included in this repo)
- **Deployment:** Vite for frontend, Flask for backend

## Directory Structure
```
frs_bolt/
├── backend/           # Flask backend API
│   ├── app/           # Application code
│   ├── models/        # ML models and scalers
│   ├── requirements.txt
│   └── run.py
├── src/               # React frontend
│   ├── App.tsx
│   └── ...
├── uploads/           # Uploaded images
├── index.html
├── package.json
├── vite.config.ts
└── ...
```

## Setup Instructions
### Prerequisites
- Node.js & npm
- Python 3.8+
- pip

### Frontend Setup
```bash
cd src
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
```

### Usage
1. Start the backend server.
2. Start the frontend development server.
3. Open the frontend in your browser (usually at `http://localhost:5173`).
4. Upload before and after surgery images to compare.

## Developer Team
- Harsh
- Karan Kashyap
- Manish Choudhary

## License
This project is for academic and research purposes only.

## Acknowledgements
- Project report and system design by the development team.
- Built using open-source libraries and frameworks.
