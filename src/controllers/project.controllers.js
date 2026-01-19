import {User} from "../models/user.models.js"
import { Project } from "../models/project.models.js"
import {ProjectMember} from "../models/projectmember.models.js"
import {ApiResponse} from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import mongoose from "mongoose";
import { AvalaibleUserRole, UserRolesEnum } from "../utils/constants.js";
 

const getProjects = asyncHandler(async(req,res)=>{
    //u want get the projects which u are a member of or a admin of(u hv created)
    
    const projects= await ProjectMember.aggregate(
        [
            {
                $match:{
                    user:new mongoose.Types.ObjectId(req.user._id),
                }
             },
            {
                $lookup:{
                    from:"projects",//it is looking into our DB so projects
                    localField:"project",
                    foreignField:"_id",
                    as:"projects",
                    pipeline:[
                        {
                            $lookup:
                            {
                                from:"projectmembers",
                                localField:"_id",
                                foreignField:"project",
                                as:"projectmembers"
                            }
                        },
                         {
                $addFields:{
                    members:{
                        $size:"$projectmembers"
                    }
                }
            }
                    ]
                }
            },
           {
            $unwind:"$projects"
           },
           {
            $project:{
                project:{
                    _id:1,
                    name:1,
                    description:1,
                    members:1,
                    createdAt:1,
                    createdBy:1

                },
                role:1,
                _id:0
            }
           }
            
        ]
    );
    return res
    .status(200)
    .json(
        new ApiResponse(200,projects,"Projects Fetched Successfully")
    )
});

const getProjectById = asyncHandler(async(req,res)=>{
    const {projectId}=req.params;
    const project = await Project.findById(projectId);
    if(!project){
        throw new ApiError(404,"project not found");
    }
     return res.
     status(200)
     .json(
        new ApiResponse(200,project,"project found and details returned")
     )
});


const createProject = asyncHandler(async(req,res)=>{
    //test
    const {name,description}=req.body;
    if(!name || !description)
    {
        throw new ApiError(400,"please send required data")
    }
    const project=await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id)
    });
    const projectmember=await ProjectMember.create({
        user:new mongoose.Types.ObjectId(req.user._id),
        project:new mongoose.Types.ObjectId(project._id),
        role:UserRolesEnum.ADMIN
    });
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            project,
        `The project is created successfully by ${projectmember} `
    ))

});


const updateProject = asyncHandler(async(req,res)=>{
     const {name,description} = req.body;
     const {projectId}=req.params;
     const project = await Project.findByIdAndUpdate(projectId,{
        name,
        description
     },{new:true});
     if(!project){
        throw new ApiError(404,"Cannot update or cannot find the project")
     }
     return req
     .status(200)
     .json(
        new ApiResponse(200,project,"project updated successfully")
     )
});


const deleteProject = asyncHandler(async(req,res)=>{
    const {projectId}=req.params;
    const project= await Project.findByIdAndDelete(projectId);
    if(!project){
        throw new ApiError(404,"Project not found")
    }
     return req
     .status(200)
     .json(
        new ApiResponse(200,project,"project deleted successfully"))
});


const addMembersToProject = asyncHandler(async(req,res)=>{
    const {email,role}=req.body;
    const {projectId}=req.params;
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(404,"user not found");
    }
    const newProjMember=await ProjectMember.findOneAndUpdate({
        user:new mongoose.Types.ObjectId(user._id),
        project:new mongoose.Types.ObjectId(projectId)
    },
{
     user:new mongoose.Types.ObjectId(user._id),
        project:new mongoose.Types.ObjectId(projectId),
        role:role,
},
{
    new:true,  
    upsert:true,
})
return res.status(201).json(new ApiResponse(200,"user added or role updated successfully"));


});


const getProjectMembers = asyncHandler(async(req,res)=>{
    const {projectId}=req.params;
    const project = await Project.findById(projectId);
    if(!project){
        throw new ApiError(404,"Project Not found");
    }
    const projectMembers = await ProjectMember.aggregate([
        {
            $match:{
                project:new mongoose.Types.ObjectId(projectId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"user",
                foreignField:"_id",
                as:"user",
                pipeline:[
                    {
                        $project:{
                            
                            
                            _id:1,
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    },
                    {
                        $addFields:{
                            user:{
                                $arrayElemAt: ["$user",0]
                            }
                        }
                    },
                    
                ]
            }
        },
        {
                        $project:{
                            project:1,
                            user:1,
                            role:1,
                            createdAt: 1,
                            updatedAt:1,
                            _id:0
                        }
                    }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,projectMembers,"members fetched successfuly"))
});


const updateMemberRole = asyncHandler(async(req,res)=>{
    const {projectId,userId} = req.params;
    const {newRole} = req.body;
    if(!AvalaibleUserRole.includes(newRole))
    {
        throw new ApiError(400,"Invalid Role");
    }
    let projectMember = await ProjectMember.findOne({
        project:new mongoose.Types.ObjectId(projectId),
        user:new mongoose.Types.ObjectId(userId)
    })
    if(!projectMember)
    {
        throw new ApiError(400,"project member not found");
    }
    const projectMem=await ProjectMember.findByIdAndUpdate(
        projectMember._id,
        {
            $set:{role:newRole}
        },
        {new:true}//returns the updated document not the collection(not to get confused)
    )
    if(!projectMem)
    {
        throw new ApiError(400,"Some Error");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,"member role updated successfully")
    )
});


const deleteMember = asyncHandler(async(req,res)=>{
    const {projectId,userId} = req.params;
    
    
    let projectMember = await ProjectMember.findOne({
        project:new mongoose.Types.ObjectId(projectId),
        user:new mongoose.Types.ObjectId(userId)
    })
    if(!projectMember)
    {
        throw new ApiError(400,"project member not found");
    }
    const projectMem=await ProjectMember.findByIdAndDelete(
        projectMember._id,
        
        
    );
    if(!projectMem)
    {
        throw new ApiError(400,"Some Error");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,"member role deleted successfully")
    )
});

export{
    getProjects,
    createProject,
    getProjectById,
    getProjectMembers,
    deleteProject,
    deleteMember,
    updateMemberRole,
    updateProject,
    addMembersToProject
}
