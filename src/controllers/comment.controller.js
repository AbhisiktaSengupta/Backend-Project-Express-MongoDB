import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}=req.params
    const {content}=req.body
    if(!isValidObjectId(videoId))
        {
            throw new ApiError(400,"Invalid video Id")
        }
    if(!content || content.trim()==="")
        {
            throw new ApiError(400,"Content cannot be empty !!")
        }    
    const comment=await Comment.create({
        content:content,
        video:videoId,
        owner:req.user._id
    })  
    if(!comment)
        {
            throw new ApiError(400,"Failed to add comment")
        }  
    return res.status(200).json(new ApiResponse(200,comment,"Comment added successfully"))    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params
    const {content}=req.body
    if(!isValidObjectId(commentId))
        {
            throw new ApiError(400,"Invalid comment Id")
        }
    if(!content || content.trim()==="")
        {
            throw new ApiError(400,"Content cannot be empty!!")
        }    
    const comment=await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment not found!");
    }
    if(comment.owner.toString()!==req.user?._id.toString())
        {
            throw new ApiError(403,"You don't have permission to update this comment!")
        }
    const updatedComment=await Comment.findByIdAndUpdate(commentId,
        // {
        //     content:content
        // }
        {
            $set:{
                content:content
            }
        },
        {
            new:true
        }
    )    
    if(!updateComment)
        {
            throw new ApiError(400, "Error while updating comment")
        }
    
        return res.status(200)
        .json( new ApiResponse(200, updatedComment, "Comment Updated Successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params
    if(!isValidObjectId(commentId))
        {
            throw new ApiError(400,"Invalid comment Id")
        }    
    const comment=await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment not found!");
    }
    if(comment.owner.toString()!=req.user?._id.toString())
        {
            throw new ApiError(403,"You don't have permission to delete this comment!")
        }
    const deleteComment=await Comment.findByIdAndDelete(commentId)
    if(!deleteComment){
        new ApiError(400,"Error: Comment NOT deleted")
    }

    return res.status(200)
    .json( new ApiResponse(
        200,
        {deleteComment},
        "Comment Deleted Successfully"
    ))    

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }