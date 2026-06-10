import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema=new Schema({
videoFile:{
    type:String,
    required:true,
   
},
thumbnail:{
    type:String,
    required:true,
   
},
title:{
    type:String,
    required:true,
   
},
description:{
    type:String,
    required:true,
   
},
category:{
    type:String,
    default:"Other",
},
duration:{
    type:Number,// cloudanry
    required:true,
   
},
views:{
 type:Number,
 default:0,
},
isPublished:{
 type:Number,
 default:true,
},
owner:{
 type:Schema.Types.ObjectId,
 ref:"User"
 
},

},{timestamps:true})

export const Videos = mongoose.model("Video",videoSchema)
