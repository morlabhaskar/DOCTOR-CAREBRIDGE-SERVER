import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'

//API to register user
const registerUser = async (req,res) => {
    try {
        
        const {name,email,password} = req.body

        if(!name || !email || !password) {
            return res.json({success:false,message:"Missing Details"})
        }

        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Enter a Valid Email"})
        }

        if (password.length < 8) {
            return res.json({success:false,message:"Enter a Strong Password"})
        }

        //HASHING USER PASSWORD
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = {
            name,
            email,
            password:hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

        res.json({success:true,token})



    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API for login user
const loginUser = async (req,res) => {
    try {

        const {email,password} = req.body;
        const user = await userModel.findOne({email})

        if(!user) {
            return res.json({success:false,message:"User Not Found"})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch) {
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
            res.json({success:true,token})
        }
        else{
            res.json({success:false,message:"Invalid Credentials"})
        }

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


//API to get user profile data
const getProfile = async (req,res) => {
    try {

        const {userId} = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({success:true,userData})


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//UPDATE the user profile
const updateProfile = async (req,res) => {
    try {

        const {userId,name,phone,dob,gender,address} = req.body
        const imageFile = req.file

        if(!name || !phone || !dob || !gender){
            return res.json({success:false,message:"Data Missing"})
        }

        await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})
        
        if(imageFile) {
            //upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageURL})

        }
        res.json({success:true,message:"Profile Updated"})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to book appointment
const bookAppointment = async(req,res) => {
    try {
        
        const {userId,docId,slotDate,slotTime} = req.body

        const docData = await doctorModel.findById(docId).select('-password')

        if(!docData){
            console.log("Doctor not found for ID:", docId);
            return res.json({success:false,message:"Doctor not Found"})
        }

        if (!docData.available) {
            console.log("Doctor is unavailable:", docData.name);
            return res.json({ success: false, message: "Doctor not available" });
        }

        // Initialize or log slots_booked to ensure it's defined
        let slot_booked = docData.slot_booked || {}
        console.log("Initial Slots Booked:", slot_booked);

        //checking for slot availability
        if(slot_booked[slotDate]){
            console.log(`Slot date ${slotDate} exists. Checking if time slot ${slotTime} is available...`);
            if(slot_booked[slotDate]?.includes(slotTime)){
                console.log(`Slot ${slotTime} on ${slotDate} is already booked.`);
                return res.json({success:false,message:"Time slot not available"})
            }
            else{
                console.log(`Slot ${slotTime} on ${slotDate} is available, adding it.`);
                slot_booked[slotDate].push(slotTime)
            }
        }
        else{
            console.log(`Slot date ${slotDate} does not exist. Initializing and adding slot ${slotTime}.`);
            slot_booked[slotDate] = []
            slot_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')
        console.log("User Data Retrieved:", userData);

        delete docData.slot_booked

    
        // Log appointment data before saving
        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount:docData.fees,
            slotDate,
            slotTime,
            date:Date.now()
        }
        console.log("New Appointment Data:", appointmentData);

        // Save the new appointment
        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()
        console.log("Appointment saved successfully");

        // Update doctor with new slot data
        await doctorModel.findByIdAndUpdate(docId,{slot_booked})
        console.log("Doctor's slots_booked updated successfully");

        res.json({success:true,message:"Appointment booked successfully"})

    } catch (error) {
        console.error("Error booking appointment:", error);
        res.json({ success: false, message: error.message });
    }
}




//API for check the slot
const getSlotBooking = async(req,res) => {
    const { docId } = req.params;
  try {
    // Assume you have a model `Appointment` to fetch booked slots
    const bookedSlots = await appointmentModel.find({ docId }).select('datetime -_id'); 
    res.json({ success: true, bookedSlots });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ success: false, message: "Failed to fetch booked slots" });
  }
}


export {registerUser,loginUser,getProfile,updateProfile,bookAppointment,getSlotBooking}