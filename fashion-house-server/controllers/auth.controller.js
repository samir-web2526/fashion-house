const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            profilePhoto,
            phone,
            address
        } = req.body;

        const db = getDB();
        const usersCollection = db.collection("users");

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await usersCollection.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Validation failed",
                errors: [
                    {
                        field: "email",
                        message: "Email already exists"
                    }
                ]
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            provider: "local",
            profilePhoto,
            phone,
            address,
            role: "customer",
            isVerified: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await usersCollection.insertOne(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            insertedId: result.insertedId
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const db = getDB();

        const usersCollection = db.collection("users");

        const normalizedEmail = email.trim().toLowerCase();

        const user = await usersCollection.findOne({
            email: normalizedEmail
        });

        if (user && user.provider === "google") {
    return res.status(400).json({
        success: false,
        message: "Please continue with Google."
    });
}

        if (!user) {
    return res.status(401).json({
        success: false,
        message: "Validation failed",
        errors: [
            {
                field: "email",
                message: "Invalid email or password"
            },
            {
                field: "password",
                message: "Invalid email or password"
            }
        ]
    });
}

        const isPasswordMatched = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatched) {
    return res.status(401).json({
        success: false,
        message: "Validation failed",
        errors: [
            {
                field: "email",
                message: "Invalid email or password"
            },
            {
                field: "password",
                message: "Invalid email or password"
            }
        ]
    });
}

        const accessToken = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        const refreshToken = jwt.sign(
            {
                id: user._id.toString()
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).send({
            success: true,
            message: "Login successful",
            accessToken,
            refreshToken
        });
    } catch (error) {

        console.log(error);

        res.status(500).json({
    success: false,
    message: "Internal Server Error"
});
    }
};

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const db = getDB();
        const usersCollection = db.collection("users");

        const email = payload.email.toLowerCase();

        let user = await usersCollection.findOne({ email });

        if (!user) {

            const newUser = {
                name: payload.name,
                email,
                password: null,
                provider: "google",
                profilePhoto: payload.picture,
                phone: "",
                address: "",
                role: "customer",
                googleId: payload.sub,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await usersCollection.insertOne(newUser);

            user = {
                ...newUser,
                _id: result.insertedId
            };
        }

        const accessToken = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        const refreshToken = jwt.sign(
            {
                id: user._id.toString()
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            accessToken,
            refreshToken
        });

    } catch (error) {

        console.log(error);

        return res.status(401).json({
            success: false,
            message: "Google authentication failed"
        });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax"
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax"
        });

        res.status(200).send({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
    success: false,
    message: "Internal Server Error"
});
    }
};

const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

       if (!token) {
    return res.status(401).json({
        success: false,
        message: "Refresh token not found"
    });
       }

        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET
        );

        const db = getDB();

        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({
            _id: new ObjectId(decoded.id)
        });

       if (!user) {
    return res.status(404).json({
        success: false,
        message: "User not found"
    });
}

        const accessToken = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        const newRefreshToken = jwt.sign(
            {
                id: user._id.toString()
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.send({
            message: "Token refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.log(error);
        return res.status(401).json({
    success: false,
    message: "Invalid refresh token"
});

    }
};

module.exports = {
    register,
    login,
    googleLogin,
    logout,
    refreshToken
};