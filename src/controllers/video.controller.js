import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    const { 
        page = 1, 
        limit = 10, 
        query, 
        sortBy, 
        sortType, 
        userId = req.user?._id } = req.query
    const user = await User.findById({
        _id : userId,
    })
    if(!user) {
        throw new ApiError(400, "User not found")
    }

    const allVideos = await Video.aggregate([
        { 
            $match : {
                videoOwner : new mongoose.Types.ObjectId(userId),
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            }
        },
        {
            $sort : {
                [sortBy]: sortType,
            }
        },
        {
            $skip : (page - 1) * limit
        },
        {
            $limit : parseInt(limit)
        }
    ])

    Video.aggregatePaginate(allVideos,{
        page, 
        limit
    })
    . then((result) => {
        return res.status(200)
        .json( new ApiResponse(200, result, "All videos successfully fetched"))
    })
    .catch((err) => {
        throw new ApiError(500, "Something went wrong while getting all videos from user" || err.message)
    });
})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!title || title.trim()==="")
        {
            throw new ApiError(400,"Title is required")
        }
    if(!description || description.trim()==="")
        {
            throw new ApiError(400,"Description is required")
        }  
    const videoFileLocalPath=req.files?.videoFile[0]?.path
    if(!videoFileLocalPath)
        {
            throw new ApiError(400,"Video file is required")
        }

    const thumbnailLocalPath=req.files?.thumbnail[0]?.path
    if(!thumbnailLocalPath)
        {
            throw new ApiError(400,"Thumbnail is required")
        }

    const videoFile=await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)
    if(!videoFile)
        {
            throw new ApiError(400,"Video file is not uploaded on cloudinary")
        }
    if(!thumbnail)
        {
            throw new ApiError(400,"Thumbnail is not uploaded on cloudinary")
        }    
    const video=await Video.create({
        videoFile:{
            public_id: videoFile?.public_id,
            url: videoFile?.url
        },
        thumbnail:{
            public_id: thumbnail?.public_id,
            url: thumbnail?.url
        },
        title,
        description,
        duration:videoFile.duration,
        owner:req.user?._id
    }) 
    if(!video)
        {
            throw new ApiError(400,"Error while creating video")
        }
    return res
    .status(200)   
    .json(new ApiResponse(201,video,"Video created successfully"))
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId)
        {
            throw new ApiError(400,"Invalid video id")
        }
    const video=await Video.getVideoById(videoId)
    if(!video)
        {
            throw new ApiError(404,"Video not found")
        }    
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video Fetched successfully"))    
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, description}=req.body
    const updateThumbnailPath=req.files?.path
    if(!isValidObjectId(videoId))
        {
            throw new ApiError(400,"Invalid Video Id")
        }
    if((!title || title.trim()==="")||(!description || description.trim()==="")||(!updateThumbnailPath))
        {
            throw new ApiError(400,"Atleast one update fields must be provided")
        }      
    const video=await Video.findById(videoId)
    if(!video)
        {
            throw new ApiError(404,"Video not found")
        }
    if(video.owner.toString()!==req.user._id.toString())
        {
            throw new ApiError(403,"You don't have permission to update this video!")
        }
    let updatedFields=await findByIdAndUpdate(video._id,
        {
            $set:{
                title:title?title:video.title,
                description:description?description:video.description
            }
        },
        {
            new:true
        }
    )
    if(updateThumbnailPath)
        {
            await deleteFromCloudinary(video.thumbnail?.public_id)
            const newThumbnail=await uploadOnCloudinary(updateThumbnailPath)    
             if(!newThumbnail)
                {
                throw new ApiError(400,"Thumbnail is not uploaded on cloudinary")
                } 
                updatedFields.$set={
                    thumbnail:{
                        public_id: newThumbnail?.public_id,
                        url: newThumbnail?.url
                    }
                }
        }    
        const finalUpdatedFields =await Video.findByIdAndUpdate(video._id,
            updatedFields,
            {
                new:true
            }
        )
        if(!updatedVideo){
            throw new ApiError(400, "Something went wrong wile updating the video details")
        }
    
        return res.status(200)
        .json( new ApiResponse(200,finalUpdatedFields, 
            "Video Details Updated!"))
    

    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId)
        {
            throw new ApiError(400,"Invalid video id")
        }
    const video=await Video.getVideoById(videoId)
    if(!video)
        {
            throw new ApiError(404,"Video not found")
        }   
    if(video.owner.toString()!==req.user?._id.toString())
        {
            throw new ApiError(403,"You don't have permission to delete this video!")
        }    
    const delVideoFromCloudinary=await deleteFromCloudinary(video.videoFile.public_id)
    if(!delVideoFromCloudinary)
        {
            throw new ApiError(400,"Something went wrong while deleting video from cloudinary")
        }
    const delThumbnailFromCloudinary=await deleteFromCloudinary(video.thumbnail.public_id)
    if(!delThumbnailFromCloudinary)
        {
            throw new ApiError(400,"Something went wrong while deleting thumbnail from cloudinary")
        }    
    const deleteVideo=await Video.findByIdAndDelete(videoId)
    if(!deleteVideo)
        {
            throw new ApiError(400,"Something went wrong while deleting video")
        }    
        return res.status(200)
        .json(new ApiResponse(200,deleteVideo,"Video deleted succesfully"))
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params 
    if(!videoId)
        {
            throw new ApiError(400,"Invalid video id")
        }
    const video=await Video.getVideoById(videoId)
    if(!video) 
        {
            throw new ApiError(404,"Video not found")
        }  
    if(video.owner.toString()!==req.user._id.toString())
        {
            throw new ApiError(400,"You are not allowed to change the publish status of this video")
        }    
    
    if(video.isPublished)
        {
            const updateVideoStatus=await Video.findByIdAndUpdate(video?._id,
                {
                    $set:{
                        isPublished:false
                    }
                },
                {
                    new:true
                }
            )
        } 
        else{
            const updateVideoStatus=await Video.findByIdAndUpdate(video?._id,
                {
                    $set:{
                        isPublished:true
                    }
                },
                {
                    new:true
                }
            )
        }   
        if(!updateVideoStatus)
            {
                throw new ApiError(400,"Something went wrong while updating video status")
            }    
        return res.status(200)
        .json(200,updateVideoStatus,"Video status updated successfully")    

        // video.isPublished = !video.isPublished

        // await video.save({validateBeforeSave : false})
    
        // return res.status(200)
        // .json(200, video, "Video Status updated")  //Prantik's code
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}