# 🧠 Schema Form Builder

A full-stack JSON Schema-driven dynamic form builder with live validation and persistent submissions. Built with **React + Vite** on the frontend and **Vercel Serverless Functions** for backend logic (API routes).

## ✨ Features

- 🔧 Upload any valid JSON Schema
- 🎨 Dynamically render a form based on the schema
- ✅ Live client-side validation
- 🧠 Server-side validation on submit (shared schema)
- 💾 Submission storage per schema
- 📦 Export and import forms with saved data
- ☁️ Fully deployed on Vercel

---

## 🚀 Getting Started (Local Dev)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/schema-form-builder.git
cd schema-form-builder
```

### 2. Install dependencies
```bash
npm install 
```

### 3. Start the Dev Server
```bash
npm run dev
```

## Sample JSON Schema
```
{
  "title": "User Registration",
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": {
      "type": "string",
      "title": "Full Name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email Address"
    },
    "age": {
      "type": "integer",
      "title": "Age",
      "minimum": 18
    }
  }
}
```


## Contributing
Pull requests welcome! Feel free to open issues or suggest features.
