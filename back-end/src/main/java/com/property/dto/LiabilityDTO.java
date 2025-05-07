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
public class LiabilityDTO {
    private UUID id;
    private String liabilityType;
    private Boolean isPrimaryResidence;
    private BigDecimal loanBalance;
    private BigDecimal limitAmount;
    private String lenderType;
    private BigDecimal interestRate;
    private String termType;
    private BigDecimal repaymentAmount;
    private String repaymentFrequency;
    private String loanType;
    private String description;
} 