import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        console.log(`[auth] verifyJWT called - ${req.method} ${req.originalUrl} ip=${req.ip} host=${req.get("host")}`);
        const token =
            req.cookies?.AccessToken ||
            req.header("Authorization")?.replace("Bearer ", "");


        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided",
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found",
            });
        }

        req.user = user;
        next();
    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid or expired token",
        });
    }
});

