package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResponse {
    private PortfolioDTO currentPortfolio;
    private PortfolioDTO projectedPortfolio;
    private BigDecimal monthlyCashFlowChange;
    private BigDecimal annualReturnChange;
    private BigDecimal totalValueChange;
    private BigDecimal totalDebtChange;
    private BigDecimal totalEquityChange;
    private BigDecimal cashOnCashReturn;
    private BigDecimal capRate;
    private BigDecimal debtToIncomeRatio;
} 