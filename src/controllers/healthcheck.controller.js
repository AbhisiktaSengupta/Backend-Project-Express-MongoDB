import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    try {
        return res
        .status(200)
        .json(new ApiResponse(200,{},"HealthCheck successfully done"))

    } catch (error) {
        return res
        .status(400)
        .json(new ApiError(400,{}, error.message || "Error while doing HealthCheck"))
    }
})

export {
    healthcheck
    }
    