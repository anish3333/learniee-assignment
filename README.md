# YackStack - MERN+SOCKE.IO Chat Application

This repository contains two main folders:  
- **client**: A React-based frontend built with Vite and TypeScript.  
- **server**: A Node.js backend using Express and MongoDB.  

Both parts are hosted on Render. Replace the placeholders with your hosted URLs and Git repository URL before sharing.  

---

## Git Repository  
[Repository URL](https://github.com/anish3333/learniee-assignment)  

---

## Setup Instructions  

### Prerequisites  
Ensure you have the following installed:  
- Node.js (v16 or higher)  
- npm or yarn  
- MongoDB Atlas account  

---

### Backend (Server)  

1. **Navigate to the `server` folder**:  
   ```bash  
   cd server  
   ```  

2. **Install dependencies**:  
   ```bash  
   npm install  
   ```  

3. **Set environment variables**:  
   Create a `.env` file in the `server` folder with the following content:  
   ```env  
   PORT=  
   MONGODB_URI= 
   JWT_SECRET= 
   NODE_ENV=development  
   DB_NAME=  
   CLIENT_URL= 
   LOCAL_URL=http://localhost:5174  
   ```  

4. **Start the server**:  
   ```bash  
   npm start  
   ```  
   The backend should now run on `http://localhost:5000`.  

---

### Frontend (Client)  

1. **Navigate to the `client` folder**:  
   ```bash  
   cd client  
   ```  

2. **Install dependencies**:  
   ```bash  
   npm install  
   ```  

3. **Set environment variables**:  
   Create a `.env` file in the `client` folder with the following content:  
   ```env  
   VITE_SERVER_URL=
   ```  

4. **Start the client**:  
   ```bash  
   npm run dev  
   ```  
   The frontend should now run on `http://localhost:5174`.  

---

## Hosting  

### Backend  
The backend is hosted on Render at:  
[Backend Hosted URL](https://learniee-server-js.onrender.com)  

### Frontend  
The frontend is hosted on Render at:  
[Frontend Hosted URL](https://learniee-assignment-client.onrender.com)  

---

## Notes  
- Make sure the frontend `VITE_SERVER_URL` matches the hosted backend URL.  
- For production, ensure sensitive environment variables are stored securely.  

Feel free to contribute and open issues for any bugs or enhancements.