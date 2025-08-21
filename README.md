# 🚗 Car Model Normalization System (trim_manager)


<img width="1319" height="587" alt="Screenshot 2025-08-21 at 10 16 17 AM" src="https://github.com/user-attachments/assets/cea8722b-b732-4912-9287-d094bedfd340" />
<img width="1299" height="607" alt="Screenshot 2025-08-21 at 10 16 45 AM" src="https://github.com/user-attachments/assets/d77e1f02-3c94-4c0f-ab8c-51e24ba5abe3" />



This project provides a **backend API** and a **frontend interface** for normalizing messy car make/model/trim data into consistent canonical forms.
It includes:

* **Backend**: FastAPI service for storing, processing, and reprocessing car records.
* **Frontend**: React-based UI to search, visualize, and manage normalization results.
* **Reprocessing Engine**: Uses LLM + fuzzy matching to normalize models, with bulk reprocessing support.

---

## 📂 Project Structure

```
.
├── backend/        # FastAPI app (Python)
│   ├── app.py      # Main backend entrypoint
│   ├── models/     # Database models
│   ├── services/   # Matching + reprocessing logic
│   ├── requirements.txt
│   └── README.md   # Backend-specific docs
│
├── frontend/       # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/api.js
│   ├── package.json
│   └── README.md   # Frontend-specific docs
│
└── README.md       # You are here
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone 
cd car-normalizer
```

---

## 🛠 Backend Setup



### Run Docker

```bash
docker-compose up --build
```

### Configure database

Set environment variables in `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/car_db
PERP_API_KEY=sk-xxxxxx    # if using LLM normalization
```




The backend will be available at:
👉 `http://localhost:8000`

---

## 🎨 Frontend Setup

### Requirements

* Node.js 18+
* npm or yarn



### Configure API endpoint

In `frontend/src/services/api.js`, set your backend URL:

```js
const API_URL = "http://localhost:8000";
```

### Start frontend

```bash
npm start
```

The frontend will be available at:
👉 `http://localhost:3000`

---
GO THROUGH THE SWAGGER DOCS FOR ENDPOINT INFO:

<img width="964" height="547" alt="Screenshot 2025-08-21 at 10 22 41 AM" src="https://github.com/user-attachments/assets/39fbb327-d638-417b-a11b-1819cff43cdf" />

## 🔄 Bulk Reprocessing

The backend exposes a bulk reprocessing endpoint:

### Reprocess all processed records

```bash
curl -X POST http://localhost:8000/reprocess/bulk
```

### Reprocess with a limit

```bash
curl -X POST "http://localhost:8000/reprocess/bulk?limit=500"
```

### With filters (optional)

```bash
curl -X POST "http://localhost:8000/reprocess/bulk?make=Toyota&status=processed"
```

---

## 🧪 Example Workflow

1. Upload messy car records via `/records/upload`.
2. Process them automatically with the matching system.
3. Use the frontend to review & correct records.
4. Run bulk reprocessing (`/reprocess/bulk`) when new matching logic improves.
5. Export normalized dataset.

---

## ✅ TODO / Future Work

* Add caching for LLM responses to reduce cost.
* Add aliases from the alerady processed trims. (need to add aliases from high confidence trims)
* Add bulk reproccesing for make and model/ specific trims - IMPORTANT
* Add progress tracking for bulk reprocessing jobs.
* Implement background workers (Celery/RQ) for large reprocessing jobs.
* Role-based access for reviewing records.

---
