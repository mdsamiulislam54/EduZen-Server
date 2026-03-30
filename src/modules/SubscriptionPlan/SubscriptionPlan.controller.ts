
import { Request, Response } from "express";

import status from "http-status";

import { catchAsync } from "../../shared/utils/catch-async";
import { subscriptionPlanService } from "./SubscriptionPlan.service";
import { sendResponse } from "../../shared/utils/send-response";


export const createSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  console.log(payload)
  const plan = await subscriptionPlanService.createSubscriptionPlan(payload);

  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "Subscription plan created successfully",
    data: plan,
  });
});


export const getAllSubscriptionPlans = catchAsync(async (req: Request, res: Response) => {
  const plans = await subscriptionPlanService.getAllSubscriptionPlans();

  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "All subscription plans fetched successfully",
    data: plans,
  });
});


export const getSubscriptionPlanById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const plan = await subscriptionPlanService.getSubscriptionPlanById(id as string);

  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "Subscription plan fetched successfully",
    data: plan,
  });
});


export const updateSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  const  id  = req.params.id as string;
  const payload = req.body;
  const plan = await subscriptionPlanService.updateSubscriptionPlan(id, payload);

  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "Subscription plan updated successfully",
    data: plan,
  });
});


export const deleteSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const plan = await subscriptionPlanService.deleteSubscriptionPlan(id as string);

  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "Subscription plan deleted successfully",
    data: plan,
  });
});


export const subscriptionPlanController= {
    createSubscriptionPlan,
    getAllSubscriptionPlans,
    getSubscriptionPlanById,
    updateSubscriptionPlan,
    deleteSubscriptionPlan
}