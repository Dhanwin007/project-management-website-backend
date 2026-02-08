
import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs';//file storage method
import dotenv from "dotenv";
dotenv.config();



//configure cloudinary
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET

});
const uploadOnCloudinary = async(localFilePath) => {
    try{
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"//to automatically detect what kind of file is coming in(returns a promise always)
        })
        console.log("File uploaded on cloudinary .File src:"+response.url)
        //once the file is uploaded we would like to delete it from our server
        fs.unlinkSync(localFilePath)
        return response//just throw the respone here as url may depend on type of file video or images(video may also return time)
    }catch(error)
    {   console.log("the error is",error);
        fs.unlinkSync(localFilePath)
        return null
    }
}
const deleteFromCloudinary = async (publicId)=>{
    try{
        const result= await cloudinary.uploader.destroy(publicId);
        console.log("deleted from cloudinary Public Id",publicId);
    }catch(error)
    {
        console.log("Error deleteing from cloudinary");
    }
}
export {uploadOnCloudinary,deleteFromCloudinary};
