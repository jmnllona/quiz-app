# quiz-app

A full stack quiz web application with multiple categories, built as a personal learning project.

## About

A fun quiz app originally made to host meme and funny questions. Users can pick a category and answer questions. Includes a basic admin panel for managing questions (add, edit, delete).

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **API:** Fetch API

## Project Structure

```
quiz-app/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── service/
│       └── ApiCall.js
└── src/
    ├── index.js
    ├── db.js
    ├── controllers/
    │   ├── categoryControllers.js
    │   └── questionsControllers.js
    └── routes/
        ├── categoriesRoutes.js
        └── questionsRoutes.js
```

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL

### Installation

1. Clone the repository
```
git clone https://github.com/jmnllona/quiz-app.git
```

2. Install dependencies
```
cd quiz-app
npm install
```

3. Create a `.env` file in the root directory and add your database credentials
```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

4. Run the app
```
node src/index.js
```

5. Open your browser and go to `http://localhost:3000`

## Status

Work in progress — still actively being developed.

## Author

[jmnllona](https://github.com/jmnllona)
