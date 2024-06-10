import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
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
        //delete the vid from cloudinary left
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
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}