export * from './adminEmployeeController.service';
import { AdminEmployeeControllerApiService } from './adminEmployeeController.service';
export * from './adminEmployeeController.serviceInterface';
export * from './adminFinanceController.service';
import { AdminFinanceControllerApiService } from './adminFinanceController.service';
export * from './adminFinanceController.serviceInterface';
export * from './adminMenuController.service';
import { AdminMenuControllerApiService } from './adminMenuController.service';
export * from './adminMenuController.serviceInterface';
export * from './authController.service';
import { AuthControllerApiService } from './authController.service';
export * from './authController.serviceInterface';
export * from './publicMenuController.service';
import { PublicMenuControllerApiService } from './publicMenuController.service';
export * from './publicMenuController.serviceInterface';
export const APIS = [
  AdminEmployeeControllerApiService,
  AdminFinanceControllerApiService,
  AdminMenuControllerApiService,
  AuthControllerApiService,
  PublicMenuControllerApiService,
];
