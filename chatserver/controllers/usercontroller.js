import { User } from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const isProduction = process.env.NODE_ENV === 'production';


export const register = async (req, res) => {
    try {
        // const data = req.body;
        // console.log("=====",data)
        // if(!data){
        //     return res.status(400).json({message: "req.body not undefine data"})
        // }else{
        //     return res.status(200).json({message:"req.body data successfully"})
        // }
        // console.log("debug checked",req.body)
        const { fullname, username, password, confirmPassword, gender } = req.body;
        if (!fullname || !username || !password || !confirmPassword || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" });
        }
          if (password.length < 4 || password.length > 8) {
            return res.status(400).json({ message: "Password must be between 4 and 8 characters" });
        }
        
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "Username already exit try different" });
        }

        const userWithSamePassword = await User.findOne({ password });
        if (userWithSamePassword) {
            return res.status(400).json({ message: "Password already exit try different" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // profilePhoto
       const maleProfilePhoto = `https://api.dicebear.com/7.x/adventurer/svg?seed=boy-${username}`;
const femaleProfilePhoto = `https://api.dicebear.com/7.x/adventurer/svg?seed=girl-${username}`;

        await User.create({
            fullname,
            username,
            password: hashedPassword,
            profilePhoto: gender === "male" ? maleProfilePhoto : femaleProfilePhoto,
            gender
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};
// authController.js
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: "Username is wrong" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Username or password is wrong" });
        }

        // ❗ Log but allow login
        if (user.isLoggedIn) {
            return res.status(403).json({ message: "User already logged in on another device" });
        }

        // ✅ Mark as logged in (again)
        user.isLoggedIn = true;
        await user.save();

        const tokenData = { userId: user._id };
        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '30d' });

        // console.log("========>", token);
        // console.log("###### isProduction =", isProduction);

        return res
            .status(200)
            .cookie("accessToken", token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'None' : 'Lax',
                 domain: isProduction ? "chatxfrontend.onrender.com" : "localhost",                 
                path: "/",
                maxAge: 30 * 24 * 60 * 60 * 1000
            })
            .json({
                _id: user._id,
                username: user.username,
                fullname: user.fullname,
                profilePhoto: user.profilePhoto,
                token: token
            });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error occurred" });
    }
};


export const getOtherUsers = async (req, res) => {
    try {
        const loggedInuserid = req.id;
        const otherusers = await User.find({ _id: { $ne: loggedInuserid } }).select("-password");
        return res.status(200).json(otherusers)
    } catch (error) {
        console.log(error)
    }
}
export const logout = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        // console.log("logout token:", token);

        // ✅ हमेशा cookie clear करो, चाहे token हो या ना हो
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // ⚠️ env check
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        });

        // 🔁 अगर token नहीं है, तब भी logout को success मानो
        if (!token) {
            return res.status(200).json({ message: "Logged out (no token found)." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.userId);

        if (user) {
            user.isLoggedIn = false;
            await user.save();
        }

        return res.status(200).json({ message: "Logged out successfully." });

    } catch (error) {
        console.log("Logout error:", error);

        // ✅ फिर भी cookie clear करना अच्छा practice है
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        });

        return res.status(500).json({ message: "Logout failed due to server error." });
    }
};
