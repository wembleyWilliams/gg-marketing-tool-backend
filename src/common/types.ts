export type Business = {
  logo: { data: String, mime: String },
  title: String,
  description: String,
  socialData: {
    totalFollowers: Number,
    rating: Number,
    newFollowers: Number
  },
  businessHandles: [businessHandle]
}

export type businessHandle =   {
    profileName: string,
    profileUrl: string,
    socialMedia: string
  }


export interface User {
  firstname: string,
  lastname: string,
  businessName: string,
  email: string,
  password: string,
  profilePicture: string
}
