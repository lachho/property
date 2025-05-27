import axios, { AxiosInstance, AxiosResponse } from 'axios';

// The backend expects requests with '/api' prefix as seen in all controllers
// e.g. @RequestMapping("/api/auth")
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://backend:8080';
const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

// Enable debugging to see request/response data
const DEBUG = true;

// Log the configured URLs for debugging
console.log('API Configuration:', { 
  API_BASE_URL, 
  API_URL, 
  VITE_API_URL: import.meta.env.VITE_API_URL 
});

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

export interface ProfileDto {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role?: string;
    address?: string;
    dateOfBirth?: string;
    occupation?: string;
    employer?: string;
    employmentLength?: number;
    employmentType?: string;
    onProbation?: boolean;
    maritalStatus?: string;
    dependants?: number;
    grossIncome?: number;
    nonTaxableIncome?: number;
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

// Create axios instance with retry logic
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
    timeout: 10000, // 10 second timeout
});

// Add retry configuration to the instance
(api as any).defaults.retry = 3;
(api as any).defaults.retryDelay = 1000;

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

// Add retry interceptor
api.interceptors.response.use(null, async (error) => {
    const { config } = error;
    if (!config || !config.retry) {
        return Promise.reject(error);
    }
    
    config.retryCount = config.retryCount || 0;
    
    if (config.retryCount >= config.retry) {
        return Promise.reject(error);
    }
    
    config.retryCount += 1;
    const backoff = new Promise(resolve => {
        setTimeout(() => {
            resolve(null);
        }, config.retryDelay || 1000);
    });
    
    await backoff;
    return api(config);
});

// API Service
const apiService = {
    // Test API endpoints for connectivity
    testEndpoints: async (): Promise<{[key: string]: boolean}> => {
        const results: {[key: string]: boolean} = {};
        
        // Test functions
        const testEndpoint = async (url: string, method: string = 'GET') => {
            try {
                await fetch(url, { method });
                return true;
            } catch (e) {
                console.error(`Failed to connect to ${url}:`, e);
                return false;
            }
        };
        
        // Test API endpoints
        results.baseUrl = await testEndpoint(API_BASE_URL);
        results.apiRoot = await testEndpoint(`${API_URL}`);
        results.authEndpoint = await testEndpoint(`${API_URL}/auth/test`);
        results.profilesEndpoint = await testEndpoint(`${API_URL}/profiles`);
        results.diagnosticEndpoint = await testEndpoint(`${API_URL}/diagnostic`);
        
        return results;
    },

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

        return api.post('/auth/login', data)
            .then(response => {
                console.log('Login successful:', response.data);
                return response;
            })
            .catch(error => {
                console.error('Login failed:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
                
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

        return api.post('/auth/register', data)
            .then(response => {
                console.log('Registration successful:', response.data);
                return response;
            })
            .catch(error => {
                console.error('Registration failed:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
                
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
    },
    
    // Set a user's role to ADMIN for testing
    setAdminRole: (userId: string): Promise<AxiosResponse<ProfileDto>> => {
        return api.post(`/profiles/${userId}/set-admin`);
    },

    // Create test admin user directly (diagnostic endpoint)
    createTestAdmin: (): Promise<AxiosResponse<any>> => {
        return api.post(`/test/create-admin`);
    },

    // Create test asset directly (diagnostic endpoint)
    createTestAsset: (): Promise<AxiosResponse<any>> => {
        return api.post(`/test/create-asset`);
    },

    // Create test liability directly (diagnostic endpoint)
    createTestLiability: (): Promise<AxiosResponse<any>> => {
        return api.post(`/test/create-liability`);
    },

    // Get diagnostic information
    getDiagnosticInfo: (): Promise<AxiosResponse<any>> => {
        return api.get(`/diagnostic`);
    }
};

export default apiService; 