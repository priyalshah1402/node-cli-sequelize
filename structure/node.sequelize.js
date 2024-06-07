module.exports = {
    folders: ['config', 'helper', 'Utils', 'uploads', 'controllers', 'routes', 'models', 'middleware'],
    files: [
        //database configuration
        {
            folder: 'config',
            name: 'db.config.js',
            content:
                `const sequelize = require('sequelize');
                 require('dotenv').config();
                    
                 const con = new sequelize(
                    process.env.DB_DATABASE, 
                    process.env.DB_USER,
                    process.env.DB_PASSWORD, {
                            host: process.env.DB_HOST,
                            dialect: 'mysql'
                });
                module.exports = con;`
        },
        //reponse helper
        {
            folder: 'helper',
            name: 'responseHelper.js',
            content:
                `const successResponse = (res, status, message, data) => {
                    return res.status(status).json({
                        status: status,
                        message: message,
                        data: data
                    });
                }
                const errorResponse = (res, status, message) => {
                    return res.status(status).json({
                        status: status,
                        message: message
                    });
                }
                module.exports = { successResponse, errorResponse };`
        },
        //Utils constant.js
        {
            folder: 'Utils',
            name: 'constant.js',
            content:
                `const StatusEnum = {
                    SUCCESS: 200,                  
                    NO_CONTENT: 204,                
                    ALREADY_EXIST: 409,            
                    NOT_FOUND: 404,                
                    INTERNAL_SERVER_ERROR: 500,    
                    TOKEN_EXP: 401,                
                    PATTERN_NOT_MATCH: 422,         
                }
  
                const StatusMessages = {
                    SUCCESS: 'Success',
                    NO_CONTENT: 'No Content',
                    ALREADY_EXIST: 'Already Exist',
                    NOT_FOUND: 'Not Found',
                    INTERNAL_SERVER_ERROR: 'Internal Server Error',
                    PATTERN_NOT_MATCH: 'Pattern Not Match',
                    TOKEN_EXP: "Your token has expired, please login again",
                    NO_TOKEN: "Access denied. No token provided.",
                    INVALID_TOKEN: "Invalid token.",
                }
                module.exports = { StatusEnum ,StatusMessages }`
        },
        //validation.js
        {
            folder: 'Utils',
            name: 'validation.js',
            content:
                `// Validate Email
                function validateEmail(email) {
                    // Simple email validation regex pattern
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(email);
                }

                // Validate Phone Number
                function validatePhone(phone) {
                    // Custom phone number validation logic
                    // This is a simple example, you may need to adapt it to your specific requirements
                    const phoneRegex = /^(?:\+\d{1,4}\s*)?\d{10}$/;// Assumes a 10-digit phone number
                    return phoneRegex.test(phone);
                }

                // Validate Required Field
                function validateRequiredField(value) {
                    return !!value.trim(); // Checks if the value is not empty after trimming whitespace
                }
                module.exports = { validateEmail, validatePhone, validateRequiredField };`
        },
        //uploads folder
        { folder: 'uploads', name: 'dummy', content: '// Dummy file' },
        //controllers
        {
            folder: 'controllers',
            name: 'user.controller.js',
            content:
                `const { StatusEnum, StatusMessages } = require("../Utils/constant");
                 const responseHelper = require('../helper/responseHelper');
                 const userModel = require('../models/user.model'); 
                 module.exports = {
                     user: async(req , res) => {
                        try {
                           const data = await userModel.findAll({});
                           return responseHelper.successResponse(res, StatusEnum.SUCCESS, StatusMessages.SUCCESS, data)));
                        } catch (error) {
                           return responseHelper.errorResponse(res, StatusEnum.INTERNAL_SERVER_ERROR, error.message);
                        }
                    }
                }`
        },
        //routes
        {
            folder: 'routes',
            name: 'user.route.js',
            content:
                `const express = require("express");
                 const userController = require('../controllers/auth.controller');
                 const express = require('express');
                 const router = express.Router();

                 router.get("/" ,userController.user);

                 module.exports = router;`
        },
        //models
        {
            folder: 'models',
            name: 'user.model.js',
            content:
                `const { DataTypes } = require('sequelize');
                 const con = require('../config/db.config');

                 const user = con.define('users', {
                    user_id: {
                        type: DataTypes.INTEGER,
                        autoIncrement: true,
                        primaryKey: true
                    },
                    first_name: {
                        type: DataTypes.STRING,
                        allowNull: false
                    },
                    last_name: {
                        type: DataTypes.STRING,
                        allowNull: false
                    },
                    mobile_no: {
                        type: DataTypes.STRING,
                        defaultValue: ""
                    },
                    email: {
                        type: DataTypes.STRING,
                        isUnique: true,
                        allowNull: false,
                        validate: {
                            isEmail: true
                        }
                    },
                    password: {
                        type: DataTypes.STRING,
                        allowNull: false
                    },
                    profile_image: {
                        type: DataTypes.STRING,
                        defaultValue: ""
                    },
                    type: {
                        type: DataTypes.ENUM('user', 'admin', 'superadmin'),
                        defaultValue: "user"
                    },
                    authToken: {
                        type: DataTypes.STRING,
                        allowNull: false
                    },
                    is_deleted: {
                        type: DataTypes.INTEGER,
                        defaultValue: 0
                    },
                }, {
                    tableName: 'users',
                    timestamps: true
                });

                module.exports = user;`
        },
        //middleware
        {
            folder: 'middleware',
            name: 'auth.js',
            content:
                `const jwt = require('jsonwebtoken');
                    require('dotenv').config();
                    const verify_token = async (req, res) => {
                        try {
                            const token = req.headers.authorization;
                            if (!token) {
                                return res.status(401).json({ message: 'Unauthorized' });
                            } else {
                                const bearerToken = token.split(' ')[1];
                                jwt.verify(bearerToken, process.env.SECRET_KEY, (err, user) => {
                                    if (err) {
                                        return res.status(401).json({ message: 'Invalid token' });
                                    }
                                    req.user = user;
                                    next();
                                });
                                // req.token = bearerToken;
                                // next();
                            }
                        } catch (error) {
                            return res.status(401).json({ message: error.message });
                        }
                    }
                    module.exports = { verify_token };`
        },
        //index.js
        {
            folder: '', name: 'index.js', content:
                `const express = require('express');
                const app = express();
                const con = require('./config/db.config');
                const path = require('path');
                require('dotenv').config();
                const models = require('./models/index');
                const cors = require('cors')
                const bodyParser = require("body-parser");

                const apiV1Router = express.Router();

                app.use(cors())
                app.use(express.json());
                app.use(express.urlencoded({ extended: true }));
                app.use(bodyParser.json());

                con.sync({ alter: false }).then(() => {
                    console.log("Models synchronized successfully.");
                }).catch((error) => {
                    console.log(error.message);
                });

                apiV1Router.use('/uploads', express.static('uploads'));

                const userRoute = require("./routes/user.route");

                apiV1Router.use("/user", userRoute);

                // Middleware to handle 404 Not Found error for API v1 routes
                apiV1Router.use((req, res, next) => {
                    next(createError(404, "Not found"));
                });

                // Custom error handler middleware for API v1 routes
                apiV1Router.use((err, req, res, next) => {
                    // Set the response status code to the error status or default to 500 if not specified
                    res.status(err.status || 500);
                    // Send a JSON response containing the error status and message
                    res.send({
                        error: {
                            status: err.status || 500, // Use the error's status or default to 500
                            message: err.message, // Include the error message
                        },
                    });
                });

                app.use("/api/v1" , apiV1Router);

                const http = require("https");
                const PORT = process.env.PORT || 8888;
                // Check if HTTPS is enabled via environment variable
                if (process.env.IS_HTTPS == "true") {
                    // Read private key and certificate from specified environment variable paths
                    const privateKey = fs.readFileSync(process.env.KEYPATH, 'utf8');
                    const certificate = fs.readFileSync(process.env.CARTPATH, 'utf8');
                    const credentials = { key: privateKey, cert: certificate };
                    
                    // Create HTTPS server with the provided credentials and express app
                    let server = http.createServer(credentials, app);
                    server.listen(PORT, () => {
                        console.log('HTTPS Server started on port:' ,PORT);
                    });
                } else {
                    // Start HTTP server if HTTPS is not enabled
                    app.listen(PORT, () => {
                        console.log('HTTP Server started on port:' ,PORT);
                    });
                }`
        },
        //.env file
        {
            folder: '',
            name: '.env',
            content:
                `PORT=8000
                DB_DATABASE=
                DB_USER=
                DB_PASSWORD=
                DB_HOST
                IS_HTTPS=false
                KEYPATH=
                CARTPATH=
                SECRET_KEY=`
        }
    ],
    cmd: 'npm install body-parser cors dotenv express fs http http-errors https jsonwebtoken sequelize multer node-cron mysql2'
}