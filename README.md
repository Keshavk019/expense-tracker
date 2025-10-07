# Personal Expense Tracker

A simple and intuitive Personal Expense Tracker web application built using HTML, CSS, and JavaScript, designed as part of the AI-Powered Development Assignment for Agrim Intelligence Services Pvt. Ltd.

It helps users:
- Record daily expenses
- Filter them
- View category-wise breakdowns
- Analyze monthly spending
- Persist data locally in the browser

# HOW TO RUN THE APPLICATION 

1. Clone the repository: git clone https://github.com/your-username/expense-tracker.git
2. Open the project folder: cd expense-tracker
3. Open the index.html file directly in your browser (no server required).

   You can simply double-click it or drag it into a browser window.

✅ No backend or installation is required.
All data is stored in your browser’s localStorage.


## 🌟 Key Features Implemented

### 1. Add Expense Form
- Add expenses with details: **Amount, Category, Date, and Description**  
- Categories include: Food, Transport, Entertainment, Bills, Shopping, Other  
- Input validation ensures:
  - Amount must be positive
  - Date cannot be in the future

### 2. Expense List Display
- Displays all added expenses in a responsive table  
- Each entry shows: Date, Category, Description, and Amount  
- Includes **Edit** and **Delete** buttons for managing records

### 3. Filtering
- Filter by **Category**  
- Filter by **Date Range** (From – To)  
- Clear all filters in one click  
- Filtered results update statistics and table dynamically

### 4. Statistics Dashboard
Displays:
- 💵 **Total Spending** (Filtered)  
- 📊 **Overall Total** (All-Time)  
- 🧾 **Number of Transactions**  
- 🧠 **Spending by Category** (List + Pie Chart)  

### 5. Monthly Summary
- Auto-generates monthly expense cards  
- Shows total spent each month  
- Includes **Delete Month** button to clear all records from that month

### 6. Bonus Feature ✨
- **CSV Export Feature** — Users can:
  - Export all expenses  
  - Or export filtered expenses by holding the **Shift key**  
- Data downloads as a **.csv file**


## 🧠 Cursor AI Usage Documentation

This project was developed using **Cursor AI**, leveraging its prompt-based development and code iteration capabilities.


### 💬 Interesting Prompts Used

- **"Generate a responsive and accessible HTML layout for a personal expense tracker with a summary section, filters, and a table for displaying transactions."**  
  → Helped design a well-structured and semantic HTML foundation with sections for summary, filters, and data table.

- **"Write JavaScript logic to manage expense records in localStorage, including add, edit, delete, and persistence across sessions."**  
  → Provided a base structure for handling CRUD operations while maintaining data integrity and browser persistence.

- **"Implement form validation ensuring positive amounts, valid dates, and preventing future dates, with user-friendly error messages."**  
  → Guided the creation of validation helpers and error handling integrated with live feedback in the form.

- **"Render category-wise spending statistics and visualize them using Chart.js, handling cases when no data is available."**  
  → Assisted in implementing dynamic category aggregation with an adaptive chart and an empty-state fallback message.

- **"Add monthly summary cards showing total spending per month with a delete button to remove all expenses for a specific month."**  
  → Helped structure the monthly grouping logic and deletion feature using date-based keys.

- **"Create a feature to export expense data as a CSV file, with an option to export only filtered records when Shift key is pressed."**  
  → Generated the base export logic, which was refined to support both full and filtered dataset exports dynamically.


## 🧩 How Cursor Helped

- Accelerated UI building by suggesting **semantic HTML** and **CSS grid layouts**  
- Simplified **localStorage integration** and **JSON parsing logic**  
- Provided **real-time debugging** when validation or rendering issues occurred  
- Recommended **ARIA roles** and **accessibility tags**  
- Assisted in improving **responsive design**


## 🔧 Modifications Made to AI-Generated Code

- Rewrote **storage handling** for better error resilience  
- Refined **UI layout** for mobile-first responsiveness  
- Added **toast notifications** for user feedback  
- Optimized **chart rendering** to show “No data available” placeholder  
- Implemented **delete by month** functionality and **Shift+Export CSV**


##  Challenges Faced & How They Were Solved

| Challenge                                          | Solution                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Data not updating dynamically after adding expense | Refactored render logic and ensured table + summary re-rendered after each operation |
| Duplicate category names with inconsistent casing | Added category normalization to Title Case                                           |
| Validation errors showing inconsistently           | Added centralized error handling with live updates                                   |
| Empty chart state causing visual bugs              | Added fallback text “No category data”                                               |
| Filter reset not updating summary                  | Linked filters with real-time refresh calls                                          |


## ⏱️ Time Spent

Approx. **3.5 hours**, broken down as:

- **1 hour** – UI & Layout  
- **1.5 hours** – JavaScript Logic (add, delete, filter, stats)  
- **0.5 hour** – Bonus feature (CSV export)  
- **0.5 hour** – Styling & Testing


## 🖼️ Screenshots

![Screenshot 1](screenshots/screenshot1.png)  
![Screenshot 2](screenshots/screenshot2.png)  
![Screenshot 3](screenshots/screenshot3.png)  









