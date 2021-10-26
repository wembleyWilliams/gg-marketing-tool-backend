export type Business = {
    logo: { data: String, mime: String },
    title: String,
    description: String,
    socialData: {
        totalFollowers: Number,
        rating: Number,
        newFollowers: Number
    },
    businessHandles: [{
        profileName: String,
        profileUrL: String,
    }]
}
