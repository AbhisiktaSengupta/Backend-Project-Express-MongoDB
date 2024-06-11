import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {Video} from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || name.trim()==="")
        {
            throw new ApiError(400,"Name is required")
        }
    if(!description || description.trim()==="")
        {
            throw new ApiError(400,"Description is required")
        }    
    const playlist=await Playlist.create({
        name:name,
        description:description,
        owner:req.user?._id
    })
    console.log(playlist)
    if(!playlist)
        {
            throw new ApiError(400,"Error while creating playlist")
        }
    return res
    .status(200)
    .json(new ApiResponse(201,playlist,"Playlist created successfully"))    
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId))
        {
            throw new ApiError(400,"Invalid user id")
        }
    const user=await User.findById(userId);
    if(!user)
        {
            throw new ApiError(404,"User not found")
        }
        const playLists = await Playlist.aggregate([
            {
                $match : {
                    owner : new mongoose.Types.ObjectId(userId) 
                }
            },
            {
               $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos"
               }
            },
            {
                $addFields : {
                    playlist: {
                        $first : "$videos"
                    }
                }
            }
        ])

    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId))
        {
            throw new ApiError(400,"Invalid playlist id")
        }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist)
        {
            throw new ApiError(404,"Playlist not found")
        }
        return res
        .status(200)
        .json( new ApiResponse(
            200,
            playlist,
            "Got playList successfully"
        ))    
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId))
        {
            throw new ApiError(400,"Invalid playlist id")
        }
    if(!isValidObjectId(videoId))
        {
            throw new ApiError(400,"Invalid video id")
        }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist)
        {
            throw new ApiError(404,"Playlist not found")
        }
    if(playlist.owner.toString()!==req.user._id.toString())
        {
            throw new ApiError(403,"You don't have permission to update this playlist!")
        }    
        const video = await Video.findById( videoId )
        if(!video){
            throw new ApiError(404, "No Video Found ")
        }
        if(playlist.videos.includes(videoId)){
            throw new ApiError(400, "The video is already added in playlist")
        }
        const addtoplaylist=await Playlist.findByIdAndUpdate(playlistId,
            {
                $push:{
                    videos: videoId
                }
            },
            {
                new:true
            }
        )
        if(!addtoplaylist){
            throw new ApiError(400,"Error while adding video to playlist")
        }
        return res.status(200)
        .json(new ApiResponse(200,addtoplaylist,"New video added to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId))
        {
            throw new ApiError(400,"Invalid playlist id")
        }
    if(!isValidObjectId(videoId))
        {
            throw new ApiError(400,"Invalid video id")
        }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist)
        {
            throw new ApiError(404,"Playlist not found")
        }
    if(playlist.owner.toString()!==req.user._id.toString())
        {
            throw new ApiError(403,"You don't have permission to remove video from this playlist!")
        }    
        const video = await Video.findById( videoId )
        if(!video){
            throw new ApiError(404, "No Video Found ")
        }
        if(!playlist.videos.includes(videoId)){
            throw new ApiError(400, "The video doesnot exist in playlist")
        }
        const removefromplaylist=await Playlist.findByIdAndUpdate(playlistId,
            {
                $pull:{
                    videos: videoId
                }
            },
            {
                new:true
            }
        )
        if(!removefromplaylist)
            {
                throw new ApiError(400,"Error while removing video from playlist")
            }
        return res
        .status(200)
        .json(new ApiResponse(200,removefromplaylist,"Video removed from playlist successfully"))    
    // TODO: remove video from playlist
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId))
        {
            throw new ApiError(400,"Invalid playlist id")
        }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist)
        {
            throw new ApiError(404,"Playlist not found")
        }
    if(playlist.owner.toString()!==req.user._id.toString())
        {
            throw new ApiError(403,"You don't have permission to delete this playlist!")
        }    
     const deletedPlaylist=await Playlist.findByIdAndDelete(playlistId)  //eta prantik er alada lekha ache
     if(!deletedList){
        throw new ApiError(500, "Something went wrong while deleting this playlist")
    }
    return res
    .status(200)
    .json( new ApiResponse( 
        200, 
        deletedList, 
        "PlayList Deleted Successfully"
    ))   
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => { //update mane i ki params theke nite hoye naki?
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isValidObjectId(playlistId))
        {
            throw new ApiError(400,"Invalid playlist id")
        }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist)
        {
            throw new ApiError(404,"Playlist not found")
        }
    if(playlist.owner.toString()!==req.user._id.toString())
        {
            throw new ApiError(403,"You don't have permission to delete this playlist!")
        }    
    const updatedPlaylist=await Playlist.findByIdAndUpdate(playlistId,
        {
            $set:
            {
                name:name,
                description:description
            }
        },
        {
            new:true
        }
    )
     
    if(!updatedPlaylist){
        throw new ApiError(500, "Something went wrong while updating playlist")
    }

    return res.status(200)
    .json( new ApiResponse(
        200,
        updatedPlaylist,
        "PlayList Updated Successfully"
    )) 
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}