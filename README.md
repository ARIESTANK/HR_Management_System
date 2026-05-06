# 📘 HR Management System

A modern **Human Resource Management System (HRMS)** designed to manage employee data, departments, and organizational workflows efficiently. This project demonstrates real-world backend and frontend integration using a scalable architecture.

---

## 🚀 Features

- 👤 Role-Based Access Control (Admin, HR, Employee)
- 🧑‍💼 Employee Management (Create, Update, Delete, View)
- 🏢 Department Management
- 📢 Announcements / Notice System
- 🔐 Authentication & Authorization
- 🗄️ Database Integration

---

## 🛠️ Tech Stack

- **Frontend:** React.js  
- **Backend:** Spring Boot / Node.js (update based on your implementation)  
- **Database:**  Oracle   
- **Architecture:** Layered Architecture (Controller → Service → Repository)

---

## 📁 Project Structure
HR_Management_System/
  
  │── frontend/ # React UI
  
  │── backend/ # API & business logic
  
  │── docs/ # Documentation
  
  │── README.md


---

## ⚙️ Installation & Setup

### 1. Clone Repository

git clone https://github.com/ARIESTANK/HR_Management_System.git
cd HR_Management_System

### 2. Backend Server Start

cd backend
mvn install        # if Spring Boot

### 3. Configure Database

Create a database (Oracle)
Update connection settings in:
application.properties (Spring Boot)


### 4. Backend Run

mvn spring-boot:run


### 5. Frontend Run 
cd frontend
npm install
npm start


🧪 Usage
Login as Admin / HR / Employee
Manage employee records
Assign departments and roles
Post announcements

🎯 Project Purpose
Practice full-stack development
Learn enterprise architecture (layered design)
Build a portfolio-level HR system
Understand database relationships and workflows
