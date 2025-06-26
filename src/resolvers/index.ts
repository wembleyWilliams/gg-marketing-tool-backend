// //
// // const resolvers = {
// //     Query: {
// //         user: async (parent: any, args: any, context: any)  => {
// //             return await context.db.getUserById({id: args.userId})
// //         }
// //     }
// //
// // }
// //
//
const resolvers = {
//     Query: {
//         user: async (parent: any, args: any, context: any) => {
//             try {
//                 console.log("Fetching user with ID:", args.userId);
//                 const user = await context.db.getUserById({ id: args.userId });
//                 if (!user) {
//                     throw new Error("User not found");
//                 }
//                 console.log("User fetched:", user);
//                 return user;
//             } catch (error) {
//                 console.error("Error fetching user:", error);
//                 throw new Error("Failed to fetch user");
//             }
//         },
//         business: async (parent: any, args: any, context: any) => {
//             try {
//                 console.log("Fetching business with ID: ", args.userId);
//                 const business = await context.db.getBusinessById({ id: args.userId });
//                 if (!business) {
//                     throw new Error("Business not found");
//                 }
//                 console.log("User fetched:", business);
//                 return business;
//             } catch (error) {
//                 console.error("Error fetching business:", error);
//                 throw new Error("Failed to fetch business");
//             }
//         },
//     },
};
export default resolvers