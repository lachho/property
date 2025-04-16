import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_URL = 'http://localhost:8080';

// Request interfaces
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
}

// Response interfaces
export interface AuthResponse {
    token: string;
    refreshToken: string;
}

export interface Asset {
    id?: number;
    assetType: string;
    currentValue: number;
    originalPrice: number;
    yearPurchased: number;
    ownershipPercentage: number;
    incomeAmount: number;
    incomeFrequency: string;
    description?: string;
}

export interface Liability {
    id?: number;
    liabilityType: string;
    isPrimaryResidence?: boolean;
    loanBalance: number;
    limitAmount?: number;
    lenderType: string;
    interestRate: number;
    termType: string;
    repaymentAmount: number;
    repaymentFrequency: string;
    loanType: string;
    description?: string;
}

export interface Profile {
    id?: number;
    userId?: number;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date | string | null;
    phone: string;
    address: string;
    email: string;
    
    // Occupation details
    occupation: string;
    employer: string;
    employmentLength: number;
    employmentType: string;
    onProbation: boolean;
    grossIncome: number;
    nonTaxableIncome: number;
    
    // Partner assessment
    assessWithPartner: boolean;
    partnerFirstName: string;
    partnerLastName: string;
    partnerDob?: Date | string | null;
    partnerMobile: string;
    partnerAddress: string;
    partnerEmail: string;
    partnerOccupation: string;
    partnerEmployer: string;
    partnerEmploymentLength: number;
    partnerEmploymentType: string;
    partnerOnProbation: boolean;
    partnerIncome: number;
    partnerNonTaxableIncome: number;
    
    // Expense details
    isRenting: boolean;
    rentPerWeek: number;
    monthlyLivingExpenses: number;
    residenceHistory: string;
    dependants: number;
    dependantsAgeRanges: string;
    
    // Retirement details
    retirementPassiveIncomeGoal: number;
    desiredRetirementAge: number;
    
    // From original interface
    income: number;
    additionalIncome: number;
    additionalIncomeSource: string;
    savings: number;
    assets: Asset[];
    liabilities: Liability[];
}

export interface ProfileDetailsDto {
    profile: Profile;
    assets: Asset[];
    liabilities: Liability[];
}

export interface Property {
    id?: number;
    name: string;
    address: string;
    purchasePrice: number;
    currentValue: number;
    deposit: number;
    description: string;
    userId?: number;
    status?: string;
}

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If the error is 401 and we haven't already attempted to refresh
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Attempt to refresh the token
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // No refresh token available, redirect to login
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                const response = await api.post('/auth/refresh', { refreshToken });
                
                // Update tokens in local storage
                const { token, refreshToken: newRefreshToken } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', newRefreshToken);
                
                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

// API Service
const apiService = {
    // Auth endpoints
    login: (data: LoginRequest): Promise<AxiosResponse<AuthResponse>> => {
        return api.post('/auth/login', data);
    },
    
    register: (data: RegisterRequest): Promise<AxiosResponse<AuthResponse>> => {
        return api.post('/auth/register', data);
    },
    
    // Profile endpoints
    getProfile: (): Promise<AxiosResponse<Profile>> => {
        return api.get('/profile');
    },
    
    updateProfile: (profile: Profile): Promise<AxiosResponse<Profile>> => {
        return api.put('/profile', profile);
    },
    
    // Asset endpoints
    getAssets: (): Promise<AxiosResponse<Asset[]>> => {
        return api.get('/assets');
    },
    
    createAsset: (asset: Asset): Promise<AxiosResponse<Asset>> => {
        return api.post('/assets', asset);
    },
    
    updateAsset: (id: number, asset: Asset): Promise<AxiosResponse<Asset>> => {
        return api.put(`/assets/${id}`, asset);
    },
    
    deleteAsset: (id: number): Promise<AxiosResponse<void>> => {
        return api.delete(`/assets/${id}`);
    },
    
    // Liability endpoints
    getLiabilities: (): Promise<AxiosResponse<Liability[]>> => {
        return api.get('/liabilities');
    },
    
    createLiability: (liability: Liability): Promise<AxiosResponse<Liability>> => {
        return api.post('/liabilities', liability);
    },
    
    updateLiability: (id: number, liability: Liability): Promise<AxiosResponse<Liability>> => {
        return api.put(`/liabilities/${id}`, liability);
    },
    
    deleteLiability: (id: number): Promise<AxiosResponse<void>> => {
        return api.delete(`/liabilities/${id}`);
    },
    
    // Property endpoints
    getProperties: (): Promise<AxiosResponse<Property[]>> => {
        return api.get('/properties');
    },
    
    getProperty: (id: number): Promise<AxiosResponse<Property>> => {
        return api.get(`/properties/${id}`);
    },
    
    createProperty: (property: Property): Promise<AxiosResponse<Property>> => {
        return api.post('/properties', property);
    },
    
    updateProperty: (id: number, property: Property): Promise<AxiosResponse<Property>> => {
        return api.put(`/properties/${id}`, property);
    },
    
    deleteProperty: (id: number): Promise<AxiosResponse<void>> => {
        return api.delete(`/properties/${id}`);
    },

    // Profile details endpoint (combined profile, assets, liabilities)
    getProfileDetails: (clientId: string): Promise<AxiosResponse<ProfileDetailsDto>> => {
        return api.get(`/profile/details/${clientId}`);
    },
    
    updateProfileDetails: (clientId: string, data: ProfileDetailsDto): Promise<AxiosResponse<ProfileDetailsDto>> => {
        return api.put(`/profile/details/${clientId}`, data);
    },
    
    createProfileDetails: (data: ProfileDetailsDto): Promise<AxiosResponse<ProfileDetailsDto>> => {
        return api.post('/profile/details', data);
    }
};

export default apiService; 