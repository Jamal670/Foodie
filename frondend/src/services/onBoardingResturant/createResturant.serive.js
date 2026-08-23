import api from "../../api/axios";
import { ENDPOINTS_ONBOARDING_RESTURANT } from "../../api/endpoints/onBoardingResturant/createResturant.endpoint";
import { ENDPOINTS_ONBOARDING_BRANCH } from "../../api/endpoints/onBoardingResturant/createBranch.endpoint";
import { ENDPOINTS_ONBOARDING_ORDER_TYPE } from "../../api/endpoints/onBoardingResturant/createOrderType.endpoint";

//----------------------- Create Resturant Info -----------------------
export const createResturantService = async (data) => {
  const response = await api.post(
    ENDPOINTS_ONBOARDING_RESTURANT.CREATE_RESTURANT,
    data,
  );
  return response.data;
};

//----------------------- Create Branch Info -----------------------
export const createBranchService = async (data) => {
  const response = await api.post(
    ENDPOINTS_ONBOARDING_BRANCH.CREATE_BRANCH,
    data,
  );
  return response.data;
};

//----------------------- Create Order-Type Info -----------------------
export const createOrderTypeService = async (data) => {
  const response = await api.post(
    ENDPOINTS_ONBOARDING_ORDER_TYPE.CREATE_ORDER_TYPE,
    data,
  );
  return response.data;
};
