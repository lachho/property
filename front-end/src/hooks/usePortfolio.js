import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const usePortfolio = (userId) => {
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPortfolio = async () => {
        try {
            const response = await axios.get(`${API_URL}/portfolio/${userId}`);
            setPortfolio(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch portfolio');
        } finally {
            setLoading(false);
        }
    };

    const simulatePropertyImpact = async (simulationRequest) => {
        try {
            const response = await axios.post(`${API_URL}/portfolio/simulate`, simulationRequest);
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to simulate property impact');
        }
    };

    useEffect(() => {
        if (userId) {
            fetchPortfolio();
        }
    }, [userId]);

    return {
        portfolio,
        loading,
        error,
        refreshPortfolio: fetchPortfolio,
        simulatePropertyImpact
    };
}; 