import jwt from 'jsonwebtoken'

//Admin authentication middleware
const authAdmin = async (req,res,next) => {
    try {
        console.log("Headers Received:", req.headers);
        const {atoken} = req.headers
        if(!atoken) {
            console.log("❌ No token received!");
            return res.json({success:false,message:"Not Authorized Login one"})
        }
        const token_decode = jwt.verify(atoken,process.env.JWT_SECRET)

        if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
            return res.json({success:false,message:"Not Autorized Login to"})
        }
        next()

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


// const authAdmin = async (req, res, next) => {
//     try {
//         console.log("Headers Received:", req.headers);

//         // Extract Bearer token from 'authorization' header
//         const authHeader = req.headers.authorization;
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             console.log("❌ No valid Authorization token received!");
//             return res.json({ success: false, message: "Not Authorized Login" });
//         }

//         // Remove "Bearer " prefix
//         const token = authHeader.split(" ")[1];

//         // Verify token
//         const token_decode = jwt.verify(token, process.env.JWT_SECRET);

//         // Check if decoded token matches admin credentials
//         if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
//             console.log("❌ Invalid admin credentials!");
//             return res.json({ success: false, message: "Not Authorized Login" });
//         }

//         console.log("✅ Admin Authorized!");
//         next();
        
//     } catch (error) {
//         console.log("❌ Authentication Error:", error.message);
//         res.json({ success: false, message: error.message });
//     }
// };




export default authAdmin