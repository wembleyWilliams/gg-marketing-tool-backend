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

export interface User {
  firstname: string,
  lastname: string,
  businessName: string,
  email: string,
  password: string,
  profilePicture: string
}
