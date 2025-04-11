import React from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatCurrency } from '../utils/formatters';

const PortfolioDashboard = ({ userId }) => {
    const { portfolio, loading, error } = usePortfolio(userId);

    if (loading) return <div>Loading portfolio...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!portfolio) return <div>No portfolio found</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Total Value:</span>
                            <span>{formatCurrency(portfolio.totalValue)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Debt:</span>
                            <span>{formatCurrency(portfolio.totalDebt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Equity:</span>
                            <span>{formatCurrency(portfolio.totalEquity)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Monthly Cash Flow:</span>
                            <span>{formatCurrency(portfolio.monthlyCashFlow)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Annual Return:</span>
                            <span>{portfolio.annualReturn.toFixed(2)}%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Properties</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {portfolio.properties.map((property) => (
                            <div key={property.id} className="border rounded p-4">
                                <h3 className="font-semibold">{property.address}</h3>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div>
                                        <span className="text-sm text-gray-500">Value:</span>
                                        <p>{formatCurrency(property.currentValue)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Monthly Rent:</span>
                                        <p>{formatCurrency(property.monthlyRent)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Cash Flow:</span>
                                        <p>{formatCurrency(property.monthlyCashFlow)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Return:</span>
                                        <p>{property.annualReturn.toFixed(2)}%</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PortfolioDashboard; 