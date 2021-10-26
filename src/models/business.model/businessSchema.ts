import mongoose from 'mongoose';

const { Schema } = mongoose;

//TODO: Should be updated when we start capturing data from social media APIs
const businessSchema = new Schema({
    logo: {
        data: String,
        mime: String
    },
    title : String,
    description: String,
    socialData: {
      totalFollowers: Number,
      rating: Number,
      newFollowers: Number
    },
    businessHandles: [{
        socialMedia: String,
        profileName: String,
        profileUrL: String,
    }]
   
})

const Business = mongoose.model('Business', businessSchema);

export default Business;