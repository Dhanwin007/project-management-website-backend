import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
const getCurrentUser = asyncHandler(async(req,res)=>
{
   return res
    .status(200)
    .json(
        new ApiResponse(200,
            req.user,
            "current user fetched successfully")
    )
})  
export {getCurrentUser};