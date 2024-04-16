const mongoose = require("../config/MongoConnect");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      type: String,
      default: "/assets/images/avatar.png",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
    roles: {
      type: Object,
      required: true,
    },
    problemSolved: {
      type: [
        {
          problemSlug: String,
          solvedDate: Date,
        },
      ],
      default: [],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.hash(user.password, 12, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = async function (candidatePassword, cb) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  //   console.log({isMatch, candidatePassword, thisPassword: this.password})
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
