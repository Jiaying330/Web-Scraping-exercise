# **Web Scraping Exercise - Instructions**

## **Step 1: Install Dependencies**
Ensure all required packages are installed before running the program.

```sh
npm install
```
---

## **Step 2: Start the API Server**
The **Express API** runs on `localhost:3000` and listens for scraping requests.

### **Run the server:**
```sh
npm start
```

### **Test the API using Postman:**
Send a **POST request** to:
```
http://localhost:5000/scrape
```

#### **Request Body (JSON):**
```json
{
  "query": "San Jose, CA"
}
```
