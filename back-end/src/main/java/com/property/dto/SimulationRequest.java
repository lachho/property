package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationRequest {
    private UUID portfolioId;
    private PropertyDTO newProperty;
    private BigDecimal interestRate;
    private Integer loanTerm;
    private BigDecimal downPayment;
    private BigDecimal propertyTaxRate;
    private BigDecimal insuranceRate;
    private BigDecimal maintenanceRate;
    private BigDecimal vacancyRate;
    private BigDecimal managementRate;
} 