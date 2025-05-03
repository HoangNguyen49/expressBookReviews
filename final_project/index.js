const express = require('express'); 
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// create session for custommer
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Middleware for handling CORS and login
app.use("/customer/auth/*", function auth(req, res, next) {
    // check session and token
    if (req.session && req.session.authorization) {
        const token = req.session.authorization['accessToken'];

        // Xác minh token bằng jwt
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user; 
                next(); 
            } else {
                return res.status(403).send("User not authenticated: Invalid token");
            }
        });
    } else {
        return res.status(403).send("User not logged in");
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
