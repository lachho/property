import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Try both paths - some Spring Boot configurations use /api prefix, others don't
const API_BASE_URL = 'http://localhost:8080';
const API_URL = `${API_BASE_URL}/api`;

// Enable debugging to see request/response data
const DEBUG = true;

// Request interfaces
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
}

// Response interfaces
export interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    id?: string;
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

export interface Portfolio {
    id: string;
    userId: string;
    properties: Property[];
    totalValue: number;
    totalDebt: number;
    totalEquity: number;
    monthlyCashFlow: number;
    annualReturn: number;
}

export interface Profile {
    id?: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date | string | null;
    phone: string;
    address: string;
    email: string;
    role?: string;
    
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
    
    // Other fields
    existingLoans: number;
    maritalStatus: string;
    
    // Related entities
    assets?: Asset[];
    liabilities?: Liability[];
    portfolios?: Portfolio[];
}

export interface ProfileDetailsDto {
    profile: Profile;
    assets: Asset[];
    liabilities: Liability[];
    portfolios: Portfolio[];
}

export interface Property {
    id?: number;
    name: string;
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    price: number;
    beds: number;
    baths: number;
    area: number;
    description: string;
    growthRate: number;
    rentalYield: number;
    imageUrl?: string;
    features?: string[];
}

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false // Changed to false to match CORS config
});

// Log URL for debugging
console.log('API URL configured as:', API_URL);

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (DEBUG) {
            console.log('Request:', {
                url: config.url,
                method: config.method,
                headers: config.headers,
                data: config.data
            });
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => {
        if (DEBUG) {
            console.log('Response:', {
                status: response.status,
                data: response.data,
                headers: response.headers
            });
        }
        return response;
    },
    async (error) => {
        if (DEBUG) {
            console.error('Response error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
        }
        
        const originalRequest = error.config;
        
        // If the error is 401 and we haven't already attempted to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
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
                const { accessToken, refreshToken: newRefreshToken } = response.data;
                localStorage.setItem('token', accessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }
                
                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
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
        console.log('Login request:', data);
        
        // Helper function to format the error message
        const formatErrorMessage = (error: any) => {
            if (error.response?.data?.message) {
                return error.response.data.message;
            } else if (error.response?.data?.error) {
                return error.response.data.error;
            } else if (error.message) {
                return error.message;
            }
            return 'Login failed';
        };
        
        // First try with API_URL (includes /api prefix)
        return api.post('/auth/login', data)
            .then(response => {
                console.log('Login successful response:', response.data);
                return response;
            })
            .catch(error => {
                console.error('Login error with /api/auth/login:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
                
                // Try direct endpoint without /api prefix
                return axios.post(`${API_BASE_URL}/auth/login`, data, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            })
            .catch(error => {
                console.error('Login error with /auth/login:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
                
                // Provide meaningful error info back to user
                error.displayMessage = formatErrorMessage(error);
                throw error;
            });
    },
    
    register: (data: RegisterRequest): Promise<AxiosResponse<AuthResponse>> => {
        console.log('Register request:', data);
        
        // Helper function to format the error message
        const formatErrorMessage = (error: any) => {
            if (error.response?.data?.message) {
                return error.response.data.message;
            } else if (error.response?.data?.error) {
                return error.response.data.error;
            } else if (error.message) {
                return error.message;
            }
            return 'Registration failed';
        };
        
        // First try with API_URL (includes /api prefix)
        return api.post('/auth/register', data)
            .then(response => {
                console.log('Registration successful response:', response.data);
                return response;
            })
            .catch(error => {
                console.error('Registration error with /api/auth/register:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
                
                // Try direct endpoint without /api prefix
                return axios.post(`${API_BASE_URL}/auth/register`, data, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            })
            .catch(error => {
                console.error('Registration error with /auth/register:', {
                    message: error.message,
                    status: error.response?.status, 
                    data: error.response?.data
                });
                
                // Provide meaningful error info back to user
                error.displayMessage = formatErrorMessage(error);
                throw error;
            });
    },
    
    // Profile endpoints
    getProfile: (): Promise<AxiosResponse<Profile>> => {
        return api.get('/profiles/current');
    },
    
    getProfileById: (id: string): Promise<AxiosResponse<Profile>> => {
        return api.get(`/profiles/${id}`);
    },
    
    updateProfile: (id: string, profile: Profile): Promise<AxiosResponse<Profile>> => {
        return api.put(`/profiles/${id}`, profile);
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
    
    getProperty: (id: string): Promise<AxiosResponse<Property>> => {
        return api.get(`/properties/${id}`);
    },
    
    createProperty: (property: Property): Promise<AxiosResponse<Property>> => {
        return api.post('/properties', property);
    },
    
    updateProperty: (id: string, property: Property): Promise<AxiosResponse<Property>> => {
        return api.put(`/properties/${id}`, property);
    },
    
    deleteProperty: (id: number): Promise<AxiosResponse<void>> => {
        return api.delete(`/properties/${id}`);
    },

    // Profile details endpoint (combined profile, assets, liabilities)
    getProfileDetails: async (clientId: string): Promise<AxiosResponse<ProfileDetailsDto>> => {
        try {
            const response = await api.get(`/profiles/${clientId}/details`);
            // Validate response data
            if (!response.data) {
                throw new Error('No data received from API');
            }
            if (!response.data.profile) {
                throw new Error('Profile data is missing from API response');
            }
            return response;
        } catch (error) {
            console.error('API Error in getProfileDetails:', error);
            if (error instanceof Error) {
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
            }
            throw error;
        }
    },
    
    updateProfileDetails: (clientId: string, data: ProfileDetailsDto): Promise<AxiosResponse<ProfileDetailsDto>> => {
        return api.put(`/profiles/${clientId}/details`, data);
    },
    
    createProfileDetails: (data: ProfileDetailsDto): Promise<AxiosResponse<ProfileDetailsDto>> => {
        return api.post('/profiles/details', data);
    },
    
    // Mortgage leads endpoint 
    submitMortgageLead: (data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        loanAmount?: number;
        interestRate?: number;
        loanTerm?: string;
        repaymentFrequency?: string;
        loanType?: string;
    }): Promise<AxiosResponse<any>> => {
        return api.post('/mortgage-leads', data);
    },
    
    // Borrowing capacity leads endpoint
    submitBorrowingLead: (data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        grossIncome: number;
        partnerIncome: number | null;
        dependants: number;
        existingLoans: number;
        maritalStatus: string;
        borrowingCapacity: number;
    }): Promise<AxiosResponse<any>> => {
        return api.post('/borrowing-leads', data);
    },

    // Client endpoints
    getAllClients: (): Promise<AxiosResponse<Profile[]>> => {
        return api.get('/profiles');
    },

    // Property endpoints (alias for getProperties)
    getAllProperties: (): Promise<AxiosResponse<Property[]>> => {
        return api.get('/properties');
    },

    // Assign property to client
    assignPropertyToClient: (clientId: string, propertyId: string): Promise<AxiosResponse<any>> => {
        return api.post('/assign-property', { clientId, propertyId });
    },

    // Fetch saved properties for a user
    getSavedProperties: (userId: string, purchased?: boolean): Promise<AxiosResponse<any[]>> => {
        const params: any = { userId };
        if (typeof purchased === 'boolean') params.purchased = purchased;
        return api.get('/saved_properties', { params });
    },

    // Fetch properties by an array of IDs
    getPropertiesByIds: (ids: string[]): Promise<AxiosResponse<any[]>> => {
        return api.get('/properties', { params: { ids: ids.join(',') } });
    },

    // Check if a property is saved by a user
    isPropertySaved: (userId: string, propertyId: string): Promise<AxiosResponse<any>> => {
        return api.get(`/saved-properties/check`, { params: { userId, propertyId } });
    },

    // Add a property to a user's saved list
    addSavedProperty: (userId: string, propertyId: string): Promise<AxiosResponse<any>> => {
        return api.post('/saved-properties/add', { userId, propertyId });
    },

    // Remove a property from a user's saved list
    removeSavedProperty: (userId: string, propertyId: string): Promise<AxiosResponse<any>> => {
        return api.delete(`/saved-properties/remove`, { params: { userId, propertyId } });
    },

    // Fetch a user's portfolio (summary, properties, etc)
    getPortfolio: (userId: string): Promise<AxiosResponse<any>> => {
        return api.get(`/portfolio/${userId}`);
    }
};

export default apiService; 