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
        if (!req.body) {
            return res.status(400).json({ message: "Request body missing" });
        }
        if (!username || !password) {
            return res.status(400).json({ message: "सभी फ़ील्ड आवश्यक हैं" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "गलत उपयोगकर्ता नाम या पासवर्ड" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "गलत उपयोगकर्ता नाम या पासवर्ड" });
        }

        const tokenData = { userId: user._id };
        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
         console.log("========>",token)

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
        return res.status(500).json({ message: "सर्वर में त्रुटि हुई" });
    }
};

export const logout = (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "logged out successfully."
        })
    } catch (error) {
        console.log(error);
    }
}
export const getOtherUsers = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        // console.log(otherUsers)
        return res.status(200).json(otherUsers);

    } catch (error) {
        console.log(error);
    }
}