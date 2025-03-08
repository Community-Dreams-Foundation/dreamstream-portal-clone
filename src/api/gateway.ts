
/**
 * API Gateway for Firebase Functions
 * 
 * This file serves as a centralized API gateway to organize Firebase functions by domain
 * and provide a unified interface for the application to interact with backend services.
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '@/lib/firebase';
import * as ApiTypes from '@/types/api';

// Define API domains and their functions
export enum ApiDomain {
  AUTH = 'auth',
  TASKS = 'tasks',
  TRAINING = 'training',
  PORTFOLIO = 'portfolio',
  COMMUNICATION = 'communication',
  PERFORMANCE = 'performance',
  PAYMENTS = 'payments',
  ADMIN = 'admin',
  ACCOUNT = 'account'
}

// Cache for function instances to avoid recreating them
const functionCache: Record<string, any> = {};

/**
 * Creates a callable function with the proper domain prefix
 * @param domain The function domain
 * @param functionName The specific function name
 * @returns A callable function
 */
export const createApiFunction = <TData, TResult>(domain: ApiDomain, functionName: string) => {
  const cacheKey = `${domain}_${functionName}`;
  
  if (!functionCache[cacheKey]) {
    const functions = getFunctions();
    const fullFunctionName = `${domain}-${functionName}`;
    functionCache[cacheKey] = httpsCallable<TData, TResult>(functions, fullFunctionName);
  }
  
  return functionCache[cacheKey];
};

/**
 * Executes an API call with authentication
 * @param domain The function domain
 * @param functionName The specific function name
 * @param data The data to send
 * @returns Promise with the result
 */
export const callApi = async <TData, TResult>(
  domain: ApiDomain, 
  functionName: string, 
  data?: TData
): Promise<TResult> => {
  try {
    // Ensure user is authenticated if needed
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Authentication required');
    }
    
    // Get the callable function
    const apiFunction = createApiFunction<TData, TResult>(domain, functionName);
    
    // Call the function
    const result = await apiFunction(data);
    return result.data;
  } catch (error: any) {
    console.error(`API call failed [${domain}-${functionName}]:`, error);
    throw new Error(error.message || 'API call failed');
  }
};

// Domain-specific API interfaces
export const TasksApi = {
  createTask: (data: ApiTypes.TaskCreateData): Promise<ApiTypes.Task> => 
    callApi(ApiDomain.TASKS, 'createTask', data),
  updateTask: (data: ApiTypes.TaskUpdateData): Promise<ApiTypes.Task> => 
    callApi(ApiDomain.TASKS, 'updateTask', data),
  deleteTask: (taskId: string): Promise<void> => 
    callApi(ApiDomain.TASKS, 'deleteTask', { taskId }),
  fetchTasks: (userId: string): Promise<ApiTypes.Task[]> => 
    callApi(ApiDomain.TASKS, 'fetchTasks', { userId }),
  updateStatus: (data: ApiTypes.TaskStatusUpdateData): Promise<ApiTypes.Task> => 
    callApi(ApiDomain.TASKS, 'updateStatus', data),
  updateTimer: (data: ApiTypes.TaskTimerUpdateData): Promise<ApiTypes.Task> => 
    callApi(ApiDomain.TASKS, 'updateTimer', data),
};

export const TrainingApi = {
  fetchModules: (userId: string): Promise<ApiTypes.TrainingModule[]> => 
    callApi(ApiDomain.TRAINING, 'fetchModules', { userId }),
  updateProgress: (data: ApiTypes.TrainingModuleProgress): Promise<void> => 
    callApi(ApiDomain.TRAINING, 'updateProgress', data),
  completeModule: (data: ApiTypes.TrainingModuleProgress): Promise<void> => 
    callApi(ApiDomain.TRAINING, 'completeModule', data),
};

export const PortfolioApi = {
  fetchPortfolio: (userId: string): Promise<ApiTypes.PortfolioData> => 
    callApi(ApiDomain.PORTFOLIO, 'fetchPortfolio', { userId }),
  updatePortfolio: (data: ApiTypes.PortfolioData): Promise<ApiTypes.PortfolioData> => 
    callApi(ApiDomain.PORTFOLIO, 'updatePortfolio', data),
  sharePortfolio: (data: ApiTypes.PortfolioShareData): Promise<void> => 
    callApi(ApiDomain.PORTFOLIO, 'sharePortfolio', data),
};

export const CommunicationApi = {
  sendMessage: (data: ApiTypes.MessageData): Promise<string> => 
    callApi(ApiDomain.COMMUNICATION, 'sendMessage', data),
  fetchMessages: (data: ApiTypes.MessageQueryParams): Promise<any[]> => 
    callApi(ApiDomain.COMMUNICATION, 'fetchMessages', data),
  createConnection: (data: ApiTypes.ConnectionData): Promise<void> => 
    callApi(ApiDomain.COMMUNICATION, 'createConnection', data),
  updateConnection: (data: ApiTypes.ConnectionData): Promise<void> => 
    callApi(ApiDomain.COMMUNICATION, 'updateConnection', data),
};

export const PerformanceApi = {
  fetchMetrics: (userId: string): Promise<ApiTypes.PerformanceMetricsData> => 
    callApi(ApiDomain.PERFORMANCE, 'fetchMetrics', { userId }),
  updateGoals: (data: ApiTypes.PerformanceGoalsData): Promise<void> => 
    callApi(ApiDomain.PERFORMANCE, 'updateGoals', data),
  fetchFeedback: (userId: string): Promise<ApiTypes.PerformanceMetricsData['feedback']> => 
    callApi(ApiDomain.PERFORMANCE, 'fetchFeedback', { userId }),
};

export const PaymentsApi = {
  processPayment: (data: ApiTypes.PaymentData): Promise<string> => 
    callApi(ApiDomain.PAYMENTS, 'processPayment', data),
  fetchInvoices: (userId: string): Promise<ApiTypes.InvoiceData[]> => 
    callApi(ApiDomain.PAYMENTS, 'fetchInvoices', { userId }),
  updatePaymentMethod: (data: ApiTypes.PaymentMethodData): Promise<void> => 
    callApi(ApiDomain.PAYMENTS, 'updatePaymentMethod', data),
};

export const AdminApi = {
  fetchUsers: (): Promise<any[]> => 
    callApi(ApiDomain.ADMIN, 'fetchUsers', {}),
  updateUserRole: (data: ApiTypes.UserRoleData): Promise<void> => 
    callApi(ApiDomain.ADMIN, 'updateUserRole', data),
  fetchWaivers: (): Promise<ApiTypes.WaiverData[]> => 
    callApi(ApiDomain.ADMIN, 'fetchWaivers', {}),
  approveWaiver: (waiverId: string): Promise<void> => 
    callApi(ApiDomain.ADMIN, 'approveWaiver', { waiverId }),
  rejectWaiver: (data: { waiverId: string, comments?: string }): Promise<void> => 
    callApi(ApiDomain.ADMIN, 'rejectWaiver', data),
};

// Update LeadershipApi with proper TypeScript types
export const LeadershipApi = {
  fetchProfile: (userId: string): Promise<ApiTypes.LeadershipProfileData> => 
    callApi(ApiDomain.PERFORMANCE, 'fetchLeadershipProfile', { userId }),
  updateProfile: (data: ApiTypes.LeadershipProfileData): Promise<void> => 
    callApi(ApiDomain.PERFORMANCE, 'updateLeadershipProfile', data),
  fetchPromotionRequirements: (userId: string, targetTier: string): Promise<ApiTypes.PromotionRequirementsData> => 
    callApi(ApiDomain.PERFORMANCE, 'fetchPromotionRequirements', { userId, targetTier }),
  submitPromotionRequest: (data: ApiTypes.PromotionRequestData): Promise<void> => 
    callApi(ApiDomain.PERFORMANCE, 'submitPromotionRequest', data),
};

// New AccountApi for managing account-related operations
export const AccountApi = {
  fetchSessions: (userId: string): Promise<ApiTypes.SessionData[]> => 
    callApi(ApiDomain.ACCOUNT, 'fetchSessions', { userId }),
  terminateSession: (sessionId: string): Promise<void> => 
    callApi(ApiDomain.ACCOUNT, 'terminateSession', { sessionId }),
  terminateAllSessions: (excludeCurrentSession: boolean = true): Promise<void> => 
    callApi(ApiDomain.ACCOUNT, 'terminateAllSessions', { excludeCurrentSession }),
  fetchActivityLog: (userId: string, limit: number = 20): Promise<ApiTypes.ActivityLogData[]> => 
    callApi(ApiDomain.ACCOUNT, 'fetchActivityLog', { userId, limit }),
  exportUserData: (userId: string): Promise<ApiTypes.UserDataExportData> => 
    callApi(ApiDomain.ACCOUNT, 'exportUserData', { userId }),
  updateSecuritySettings: (settings: ApiTypes.SecuritySettingsData): Promise<void> => 
    callApi(ApiDomain.ACCOUNT, 'updateSecuritySettings', settings),
};
