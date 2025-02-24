import doctorModel from '../models/doctorModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'

const changeAvailability = async(req,res) => {

    try {
        
        const {docId} = req.body
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})
        res.json({success:true,message:"Availability Changed"})

    } catch (error) {

        console.log(error)
        res.json({success:false,message:error.message})
        
    }

}

const deleteDoctor = async (req, res) => {
    try {
        const { docId } = req.body;

        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        await doctorModel.findByIdAndDelete(docId);
        res.json({ success: true, message: "Doctor deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// const deleteDoctor = async (req, res) => {
//     try {
//         const {docId} = req.body;
//         const doctor = await doctorModel.findByIdAndDelete(docId);
        
//         if(!doctor) {
//             return res.json({ success: false, message: "Doctor not found" });
//         }
//         res.json({ success: true, message: "Doctor deleted successfully" });
//     } catch (error) {
//         console.log(error)
//         res.status(404).json({error:"Internal Server Error"});
        
//     }
// };

const doctorList = async (req,res) => {
    try {
        
        const doctors = await doctorModel.find({}).select(['-password','-email'])
        res.json({success:true,doctors})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API for login Doctor
const loginDoctor = async (req,res) => {

    try {
        const {email,password} = req.body
        const doctor = await doctorModel.findOne({email})

        if (!doctor) {
            return res.json({success:false,message:"Doctor not found"})
        }
        const isMatch = await bcrypt.compare(password,doctor.password)
        if (isMatch) {
            const token = jwt.sign({id:doctor._id},process.env.JWT_SECRET)
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

//API to get perticular doctor appointments in doctor pannel
const appointmentsDoctor = async (req,res) => {
    try {
        
        const {docId} = req.body
        const appointments = await appointmentModel.find({docId})

        res.json({success:true,appointments})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to mark appointment complete for doctor pannel
const appointmentComplete = async (req,res) => {
    try {
        
        const {docId,appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId == docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true}) 
            return res.json({success:true,message:"Appointment Completed"})  
        }
        else {
            return res.json({success:false,message:"Mark Failed!"})
        }

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to cancel appointment for doctor pannel
const appointmentCancel = async (req,res) => {
    try {
        
        const {docId,appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId == docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true}) 
            return res.json({success:true,message:"Appointment Cancelled"})  
        }
        else {
            return res.json({success:false,message:"Cancellation Failed!"})
        }

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to get dashboard data for doctor pannel
const doctorDashboard = async (req,res) => {
    try {
        const {docId} = req.body
        const appointments = await appointmentModel.find({docId})

        let patients = []

        //for unique users
        appointments.map((item)=>{
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            appointments:appointments.length,
            patients:patients.length,
            latestAppointments:appointments.reverse().slice(0,5)
        }
        res.json({success:true,dashData})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to get doctor Profile for Doctor Panel
const doctorProfile = async (req,res) => {
    try {
        const {docId} = req.body
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({success:true,profileData})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to update doctor Profile for Doctor Panel
const updateDoctorProfile = async (req,res) => {
    try {
        const {docId,fees,address,available} = req.body
        await doctorModel.findByIdAndUpdate(docId,{fees,address,available})

        res.json({success:true,message:"Profile Updated"})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//get all doctors list for Doctor pannel
const allDoctors = async (req,res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true,doctors})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }
}





export {
    changeAvailability,doctorList,loginDoctor,
    appointmentsDoctor,appointmentComplete,appointmentCancel,
    doctorDashboard,doctorProfile,updateDoctorProfile,deleteDoctor,
    allDoctors
}