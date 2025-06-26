import {getBusinessByIdDB} from "../database";

export const verifyBusinessId = async (userId: string, businessId: string) => {

    if (!businessId) {
        return {
            success: false,
            message: 'No businessId provided'
        }
    }
    const business = await getBusinessByIdDB(businessId);
    if (!business || business.userId.toString() !== userId.toString()) {
      return {
          success: false,
          message: 'User does not own business'
      }
    } else {
        return {
            success: true,
            message: 'User - Business verified'
        }
    }


}