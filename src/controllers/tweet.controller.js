import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body
    if(!content || content.trim()==="")
    {
        throw new ApiError(400,"Content is required")
    }
    const tweet=await Tweet.create({
        content,
        owner:req.user._id
    })
    if(!tweet)
    {
        throw new ApiError(400,"Failed to create tweet")
    }
    return res
    .status(200)
    .json(new ApiResponse(201,{},"Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params
    if(!isValidObjectId(userId)){
        throw new ApiError("Invalid User ID")
    }
    const user=await User.findById(userId)
    if(!user) {
        throw new ApiError(404, "User not found")
    }
    const userTweets=await Tweet.aggregate([
        {
            $match:{
                owner:user._id
            }
        }
    ])
    if(!userTweets){
        throw new ApiError(400, "Somwthing went wrong while fetching Tweets")
    }
    return res.status(200)
    .json( new ApiResponse( 200, userTweets, "Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params
    const {newcontent}=req.body
    if(!isValidObjectId(tweetId)){
        throw new ApiError("Invalid Tweet ID")
    }
    if(!content || newcontent?.trim()===""){
        throw new ApiError(400,"Content is required")
    }
    const tweet=await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(400, "Tweet not found!");
    }
    if(tweet.owner.toString()!==req.user._id.toString()) 
    {
        throw new ApiError(403, "You don't have permission to update this tweet!");
    }
    const updatedTweet=await Tweet.findByIdAndUpdate(tweet?._id, 
        {
            $set:
            {
                content:newcontent
            }
        },
        {
            new:true
        }
    )
    if(!updatedTweet)
        {
            throw new ApiError(400,"Something went wrong while updating tweet")
        }
    return res
    .status(200)
    .json(200,updatedTweet,"Tweet updated successfully")    
    })

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError("Invalid Tweet ID")
    }
    const tweet=await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(400, "Tweet not found!");
    }
    if(tweet.owner.toString()!==req.user._id.toString()) 
    {
        throw new ApiError(403, "You don't have permission to delete this tweet!");
    }
    const deletedTweet=await Tweet.findByIdAndDelete(tweetId)
    if(!deletedTweet)
        {
            throw new ApiError(400,"Something went wrong while deleting tweet")
        }
    return res
   .status(200)
   .json(new ApiResponse(200,deletedTweet,"Tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}