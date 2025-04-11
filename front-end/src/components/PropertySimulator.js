import React, { useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { formatCurrency } from '../utils/formatters';

const PropertySimulator = ({ portfolioId }) => {
    const { simulatePropertyImpact } = usePortfolio();
    const [simulation, setSimulation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        address: '',
        city: '',
        state: '',
        zipCode: '',
        purchasePrice: '',
        currentValue: '',
        mortgageAmount: '',
        monthlyRent: '',
        monthlyExpenses: '',
        interestRate: '4.5',
        loanTerm: '30',
        downPayment: '',
        propertyTaxRate: '1.2',
        insuranceRate: '0.5',
        maintenanceRate: '1.0',
        vacancyRate: '5.0',
        managementRate: '8.0'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const simulationRequest = {
                portfolioId,
                newProperty: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    purchasePrice: parseFloat(formData.purchasePrice),
                    currentValue: parseFloat(formData.currentValue),
                    mortgageAmount: parseFloat(formData.mortgageAmount),
                    monthlyRent: parseFloat(formData.monthlyRent),
                    monthlyExpenses: parseFloat(formData.monthlyExpenses)
                },
                interestRate: parseFloat(formData.interestRate),
                loanTerm: parseInt(formData.loanTerm),
                downPayment: parseFloat(formData.downPayment),
                propertyTaxRate: parseFloat(formData.propertyTaxRate),
                insuranceRate: parseFloat(formData.insuranceRate),
                maintenanceRate: parseFloat(formData.maintenanceRate),
                vacancyRate: parseFloat(formData.vacancyRate),
                managementRate: parseFloat(formData.managementRate)
            };

            const result = await simulatePropertyImpact(simulationRequest);
            setSimulation(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Property Simulation</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">City</label>
                                <Input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">State</label>
                                <Input
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Zip Code</label>
                                <Input
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Purchase Price</label>
                                <Input
                                    type="number"
                                    name="purchasePrice"
                                    value={formData.purchasePrice}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Current Value</label>
                                <Input
                                    type="number"
                                    name="currentValue"
                                    value={formData.currentValue}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Monthly Rent</label>
                                <Input
                                    type="number"
                                    name="monthlyRent"
                                    value={formData.monthlyRent}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Monthly Expenses</label>
                                <Input
                                    type="number"
                                    name="monthlyExpenses"
                                    value={formData.monthlyExpenses}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Simulating...' : 'Simulate Impact'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && (
                <div className="text-red-500">
                    {error}
                </div>
            )}

            {simulation && (
                <Card>
                    <CardHeader>
                        <CardTitle>Simulation Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Portfolio Impact</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500">Monthly Cash Flow Change:</span>
                                        <p>{formatCurrency(simulation.monthlyCashFlowChange)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Annual Return Change:</span>
                                        <p>{simulation.annualReturnChange.toFixed(2)}%</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Total Value Change:</span>
                                        <p>{formatCurrency(simulation.totalValueChange)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Total Debt Change:</span>
                                        <p>{formatCurrency(simulation.totalDebtChange)}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Property Metrics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500">Cash on Cash Return:</span>
                                        <p>{simulation.cashOnCashReturn.toFixed(2)}%</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Cap Rate:</span>
                                        <p>{simulation.capRate.toFixed(2)}%</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Debt to Income Ratio:</span>
                                        <p>{simulation.debtToIncomeRatio.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PropertySimulator; 