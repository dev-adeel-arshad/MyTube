import mongoose, { Schema } from "mongoose";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,//cloudanary url
        required: true,

    },
    coverImage: {
        type: String,//cloudanary url


    },
    watchHistory: [
        {
            videoId: {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
            watchedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    tweetHistory: [
        {
            tweetId: {
                type: Schema.Types.ObjectId,
                ref: "Tweet",
            },
            visitedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    watchHistoryPaused: {
        type: Boolean,
        default: false
    },
    watchLater: [
        {
            videoId: {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required!!"],

    },
    refreshToken: {
        type: String,
    }
    ,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationCode: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    }

},
    { timestamps: true }
);

// MODIFYING THE PASSWORD BEFORE SAVING
userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next()
this.password = await bcrypt.hash(this.password,10)
})

// BUILDING OUR CUSTOM HOOKS FOR VERYFYING PASSWORD, TOKEN GENERATIION
userSchema.methods.isPasswordcorrect = async function(password){
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  const expiresIn =
    process.env.ACCESS_TOKEN_EXPIRES_IN ||
    process.env.ACCESS_TOKEN_EXPIRAY ||
    "1d";

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  const expiresIn =
    process.env.REFRESH_TOKEN_EXPIRES_IN ||
    process.env.REFRESH_TOKEN_EXPIRY ||
    "5d";

  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn,
    }
  );
};

export const User = mongoose.model("User", userSchema)
