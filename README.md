# Digitalflake-Hackathon-assignment
Fullstack web application using ReactJs and Nodejs.
### Project Overview
We'll develop a full-stack application with the following technologies:
- **Frontend**: React, Tailwind CSS, Redux, React-Data-Grid
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT tokens stored in localStorage or cookies
- **Design**: Based on the Figma design guide

### Prerequisites
Before starting, ensure you have the following installed:
- Node.js and npm (Node Package Manager)
- MySQL
- A code editor (like Visual Studio Code)

### Step-by-Step Guide

#### Step 1: Setup Your Development Environment
1. **Install Node.js and npm**: [Download Node.js](https://nodejs.org/)
2. **Install MySQL**: [Download MySQL](https://www.mysql.com/downloads/)

#### Step 2: Create the Project Directory
Create a directory for your project and navigate into it:
```bash
mkdir my-fullstack-app
cd my-fullstack-app
```

#### Step 3: Initialize Git and npm
Initialize a new Git repository and npm project:
```bash
git init
npm init -y
```

#### Step 4: Setup Backend (Node.js and Express)
1. **Create a directory for the backend**:
    ```bash
    mkdir backend
    cd backend
    ```
2. **Initialize npm**:
    ```bash
    npm init -y
    ```
3. **Install necessary packages**:
    ```bash
    npm install express mysql2 bcryptjs jsonwebtoken dotenv
    ```
4. **Create the server file**: `server.js`
    ```javascript
    const express = require('express');
    const mysql = require('mysql2');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const dotenv = require('dotenv');

    dotenv.config();
    const app = express();
    app.use(express.json());

    // Database connection
    const db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    db.connect((err) => {
        if (err) throw err;
        console.log('MySQL Connected...');
    });

    // Register route
    app.post('/register', async (req, res) => {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
            if (err) throw err;
            res.send('User registered');
        });
    });

    // Login route
    app.post('/login', (req, res) => {
        const { username, password } = req.body;
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) throw err;
            if (results.length > 0 && await bcrypt.compare(password, results[0].password)) {
                const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.send('Invalid credentials');
            }
        });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    ```

5. **Create a `.env` file for environment variables**:
    ```plaintext
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=yourpassword
    DB_NAME=mydatabase
    JWT_SECRET=your_jwt_secret
    ```

6. **Create the MySQL database and user table**:
    ```sql
    CREATE DATABASE mydatabase;
    USE mydatabase;
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
    );
    ```

#### Step 5: Setup Frontend (React)
1. **Navigate back to the root directory**:
    ```bash
    cd ..
    ```
2. **Create a directory for the frontend**:
    ```bash
    npx create-react-app frontend
    cd frontend
    ```
3. **Install necessary packages**:
    ```bash
    npm install tailwindcss @reduxjs/toolkit react-redux axios react-data-grid
    ```

4. **Setup Tailwind CSS**:
    - Create `tailwind.config.js`:
        ```javascript
        module.exports = {
          purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
          darkMode: false, // or 'media' or 'class'
          theme: {
            extend: {},
          },
          variants: {
            extend: {},
          },
          plugins: [],
        };
        ```
    - Add Tailwind to `src/index.css`:
        ```css
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        ```

5. **Create the Redux store**:
    - Create `src/store/index.js`:
        ```javascript
        import { configureStore } from '@reduxjs/toolkit';

        export const store = configureStore({
          reducer: {
            // Add reducers here
          },
        });
        ```

    - Create `src/store/slices/userSlice.js`:
        ```javascript
        import { createSlice } from '@reduxjs/toolkit';

        export const userSlice = createSlice({
          name: 'user',
          initialState: {
            user: null,
            token: null,
          },
          reducers: {
            setUser: (state, action) => {
              state.user = action.payload.user;
              state.token = action.payload.token;
            },
            clearUser: (state) => {
              state.user = null;
              state.token = null;
            },
          },
        });

        export const { setUser, clearUser } = userSlice.actions;

        export default userSlice.reducer;
        ```

    - Update `src/store/index.js`:
        ```javascript
        import { configureStore } from '@reduxjs/toolkit';
        import userReducer from './slices/userSlice';

        export const store = configureStore({
          reducer: {
            user: userReducer,
          },
        });
        ```

6. **Create API service**: `src/services/api.js`
    ```javascript
    import axios from 'axios';

    const API = axios.create({ baseURL: 'http://localhost:5000' });

    API.interceptors.request.use((req) => {
      if (localStorage.getItem('token')) {
        req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
      }
      return req;
    });

    export const login = (formData) => API.post('/login', formData);
    export const register = (formData) => API.post('/register', formData);
    ```

7. **Create Authentication Components**:
    - `src/components/Login.js`:
        ```javascript
        import React, { useState } from 'react';
        import { useDispatch } from 'react-redux';
        import { setUser } from '../store/slices/userSlice';
        import { login } from '../services/api';

        const Login = () => {
          const [formData, setFormData] = useState({ username: '', password: '' });
          const dispatch = useDispatch();

          const handleSubmit = async (e) => {
            e.preventDefault();
            const { data } = await login(formData);
            dispatch(setUser({ user: formData.username, token: data.token }));
            localStorage.setItem('token', data.token);
          };

          return (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button type="submit">Login</button>
            </form>
          );
        };

        export default Login;
        ```

    - `src/components/Register.js`:
        ```javascript
        import React, { useState } from 'react';
        import { register } from '../services/api';

        const Register = () => {
          const [formData, setFormData] = useState({ username: '', password: '' });

          const handleSubmit = async (e) => {
            e.preventDefault();
            await register(formData);
            alert('User registered');
          };

          return (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button type="submit">Register</button>
            </form>
          );
        };

        export default Register;
        ```

8. **Create React-Data-Grid Component**:
   

 - `src/components/DataGrid.js`:
        ```javascript
        import React, { useState, useEffect } from 'react';
        import { DataGrid } from 'react-data-grid';
        import { fetchData } from '../services/api'; // Assume fetchData is defined in api.js

        const DataGridComponent = () => {
          const [rows, setRows] = useState([]);
          const columns = [{ key: 'id', name: 'ID' }, { key: 'username', name: 'Username' }];

          useEffect(() => {
            const getData = async () => {
              const { data } = await fetchData(); // Define fetchData in api.js
              setRows(data);
            };
            getData();
          }, []);

          return <DataGrid columns={columns} rows={rows} />;
        };

        export default DataGridComponent;
        ```

9. Integrate Components in App:
    - `src/App.js`:

        import React from 'react';
        import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
        import { Provider } from 'react-redux';
        import { store } from './store';
        import Login from './components/Login';
        import Register from './components/Register';
        import DataGridComponent from './components/DataGrid';

        function App() {
          return (
            <Provider store={store}>
              <Router>
                <Switch>
                  <Route path="/login" component={Login} />
                  <Route path="/register" component={Register} />
                  <Route path="/data" component={DataGridComponent} />
                </Switch>
              </Router>
            </Provider>
          );
        }

        export default App;
