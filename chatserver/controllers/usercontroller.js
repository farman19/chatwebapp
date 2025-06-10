import { User } from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
        const maleProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const femaleProfilePhoto = `https://avatar.iran.liara.run/public/girl?username=${username}`;

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

        if (user.isLoggedIn) {
            console.log({message:"User already logged in on another device"});
            return res.status(403).json({ message: "User already logged in on another device" });
        }

        // Mark as logged in
        user.isLoggedIn = true;
        await user.save();

        const tokenData = { userId: user._id };
        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

        console.log("========>", token);

        return res
            .status(200)
            .cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 86400000
            })
            .json({
                _id: user._id,
                username: user.username,
                fullname: user.fullname,
                profilePhoto: user.profilePhoto
            });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error occurred" });
    }
};


export const getOtherUsers = async (req, res)=>{
    try {
        const loggedInuserid = req.id;
        const otherusers = await User.find({_id:{$ne:loggedInuserid}}).select(".password");
        return res.status(200).json(otherusers)
    } catch (error) {
        console.log(error)
    }
}
export const logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "User not logged in." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // ⛔ User को logged out mark करो
        user.isLoggedIn = false;
        await user.save();

        // ✅ Cookie clear करो
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            domain: ".onrender.com", // ⚠️ Render पर जरूरी है
        });

        // ✅ Response भेजो
        return res.status(200).json({
            message: "Logged out successfully."
        });

    } catch (error) {
        console.log("Logout error:", error);
        return res.status(500).json({ message: "Logout failed due to server error." });
    }
};
