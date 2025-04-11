package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioDTO {
    private Long id;
    private Long userId;
    private List<PropertyDTO> properties;
    private BigDecimal totalValue;
    private BigDecimal totalDebt;
    private BigDecimal totalEquity;
    private BigDecimal monthlyCashFlow;
    private BigDecimal annualReturn;
} 