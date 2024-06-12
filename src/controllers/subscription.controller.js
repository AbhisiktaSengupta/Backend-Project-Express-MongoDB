import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid ChannelId")
    }
    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(400, "This channel does not exist")
    }
    const isSubscribed = await Subscription.findOne({
        channel:channelId,
        subscriber:req.user._id
    })
    if(isSubscribed)
        {
            const unsubscribe=await Subscription.findOneAndDelete({
                channel:channelId,
                subscriber:req.user._id
            })
            if(!unsubscribe)
                {
                    throw new ApiError(400,"Failed to unsubscribe")
                }
            return res.status(200).json(200,unsubscribe,"Succesfully unsubscribed")    
        }
    else{
        const subscribe=await Subscription.create({
            channel:channelId,
            subscriber:req.user._id
        })
        if(!subscribe)
            {
                throw new ApiError(400,"Failed to subscribe")
            }
        return res.status(200).json(200,subscribe,"Succesfully subscribed")
    }    
    
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId))
        {
            throw new ApiError(400,"Invalid channel Id")
        }
    const subscribers=await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscribers"
            }   
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                }
            }
        },
        {
            $project: {
                "subscribers.fullName": 1,
                "subscribers.username": 1,
                "subscribers.avatar": 1,
                subscribersCount: 1
            }
        }
    ])   
    if(!subscribers)
        {
            throw new ApiError(400,"Failed to fetch subscribers")
        } 
    return res.status(200).json(200,subscribers,"Successfully Fetched subscribers")    
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId))
        {
            throw new ApiError(400,"Invalid subscriber Id")
        }
    const subscribedChannels=await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channelsSubscribed"
            }
        },
        {
            $addFields:{
                noOfChannelsSubscribed:{
                    $size:"$channelsSubscribed"
                }
            }
        },
        {
            $project:{
                "channelsSubscribed.fullName":1,
                "channelsSubscribed.username":1,
                "channelsSubscribed.avatar":1,
                noOfChannelsSubscribed:1
            }
        }
    ])
    if(!subscribedChannels)
        {
            throw new ApiError(400,"Failed to fetch subscribed channels")
        }
    return res.status(200).json(200,subscribedChannels,"Succesfully fetched subscribed channels")    
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}