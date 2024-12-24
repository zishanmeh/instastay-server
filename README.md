# **InstaStay - Server Side**

## **Overview**

The server-side of InstaStay powers the platform's backend operations, ensuring secure and efficient handling of user data, authentication, and bookings. Built with Node.js and Express, it provides seamless communication between the client side and the database.

## **Technologies Used**

### **Backend Framework**

- **Express.js**: Fast, unopinionated, and minimalist web framework for Node.js.

### **Authentication**

- **JWT (JSON Web Token)**: For secure and stateless user authentication.

### **CORS Management**

- **cors**: Enables Cross-Origin Resource Sharing, allowing the client to access the server.

### **Environment Management**

- **dotenv**: For managing environment variables securely.

### **Cookie Management**

- **cookie-parser**: For handling HTTP cookies, essential for JWT-based authentication.

## **Key Features**

- **JWT Authentication**: Implements secure token-based authentication for protected routes.
- **Secure Environment Variables**: Manages sensitive credentials and configurations using dotenv.
- **CORS Support**: Ensures smooth communication between the client and server with proper CORS policies.
- **Booking Management**: Handles room bookings and availability updates.
- **Middleware Implementation**: Custom middlewares for verifying JWT tokens and protecting routes.
