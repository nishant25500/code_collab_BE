const mongoose = require('../config/MongoConnect');

const FeedbackSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

FeedbackSchema.statics.deleteById = function(id, cb){
    return this.deleteOne({
        _id: id
    }, cb);
};

module.exports = mongoose.model('Feedback', FeedbackSchema);
