import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId))
        {
            throw new ApiError(400,"Invalid video id")
        }
    const videoLike = await  Like.findOne({
        video: videoId,
        likedBy:req.user._id
    })
    if(videoLike)
        {
            const unlikeVideo=await Like.findOneAndDelete({
                video:videoId,
                likedBy:req.user._id
            })
            if(!unlikeVideo)
                {
                    throw new ApiError(400,"Failed to unlike video")
                }
            return res
            .status(200)
            .json(new ApiResponse(200,{},"Video unliked successfully"))    
        }
        else{
            const likeVideo=await Like.create({
                video:videoId,
                likedBy:req.user._id
            })
            if(!likeVideo)
                {
                    throw new ApiError(400,"Failed to like video")
                }
            return res
            .status(200)
            .json(new ApiResponse(200,{},"Video liked successfully"))    
        }
    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId))
        {
            throw new ApiError(400,"Invalid comment id")
        }
    const commentLike = await  Like.findOne({
        comment: commentId,
        likedBy:req.user._id
    })
    if(commentLike)
        {
            const unlikecomment=await Like.findOneAndDelete({
                comment: commentId,
                likedBy:req.user._id
            })
            if(!unlikecomment)
                {
                    throw new ApiError(400,"Failed to unlike comment")
                }
            return res
            .status(200)
            .json(new ApiResponse(200,{},"comment unliked successfully"))    
        }
        else{
            const likecomment=await Like.create({
                comment: commentId,
                likedBy:req.user._id
            })
            if(!likecomment)
                {
                    throw new ApiError(400,"Failed to like comment")
                }
            return res
            .status(200)
            .json(new ApiResponse(200,{},"comment liked successfully"))  
            }
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId))
        {
            throw new ApiError(400,"Invalid tweet id")
        }
    const tweetLike = await  Like.findOne({
        tweet: tweetId,
        likedBy:req.user._id
    })
    if(tweetLike)
        {
            const unliketweet=await Like.findOneAndDelete({
                tweet: tweetId,
                likedBy:req.user._id
            })
            if(!unliketweet)
                {
                    throw new ApiError(400,"Failed to unlike tweet")
                }
            return res
            .status(200)
            .json(new ApiResponse(200,{},"tweet unliked successfully"))    
        }
        else{
            const liketweet=await Like.create({
                tweet: tweetId,
                likedBy:req.user._id
            })
            if(!liketweet)
                {
                    throw new ApiError(400,"Failed to like tweet")
                }
            return res
            .status(200)
            .json(new ApiResponse(200,{},"tweet liked successfully"))  
            }
    
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const videos=await Like.aggregate([
        {
            $match:{
                likedBy:req.user._id
            },
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"likedVideos"
            }

        }
    ])
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}