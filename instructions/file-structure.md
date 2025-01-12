roi-backend/
├── .env                     # Environment variables (e.g. VAPID_PUBLIC_KEY)
├── package.json             # Project metadata and dependencies
├── package-lock.json        # Locked versions of dependencies
├── README.md                # Documentation
├── src/
    ├── server.js                # Entry point 
    to start the server
    ├── config/
    │   └── db.js            # Database connection or other config
    ├── controllers/
    │   └── notificationController.js  # Logic that handles sending notifications
    ├── middlewares/
    │   └── authMiddleware.js # Any custom Express middlewares (e.g., authentication)
    ├── models/
    │   └── User.js          # Example Mongoose/Sequelize model
    ├── routes/
    │   └── index.js         # Combines or organizes all routes
    │   └── notificationRoutes.js  # Routes specific to notifications
    ├── services/
    │   └── notificationService.js  # Business logic for push notifications
    ├── utils/
    │   └── helpers.js       # Reusable utilities, helper functions
    └── app.js               # Express app configuration and middleware setup