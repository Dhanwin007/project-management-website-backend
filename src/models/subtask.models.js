import mongoose from "mongoose";

const subTaskSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    task:{//task to which the subtask belongs
        type:mongoose.Schema.Types.ObjectId,
        ref:"Task",
        required:true

    },
    isCompleted:{
        type:Boolean,
        default:false
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})
export const Subtask = mongoose.model("Subtask",subTaskSchema);