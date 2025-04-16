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
public class PropertyDTO {
    private UUID id;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private BigDecimal purchasePrice;
    private BigDecimal currentValue;
    private BigDecimal mortgageAmount;
    private BigDecimal monthlyRent;
    private BigDecimal monthlyExpenses;
    private BigDecimal monthlyCashFlow;
    private BigDecimal annualReturn;
    private Integer yearBuilt;
    private Integer bedrooms;
    private Integer bathrooms;
    private BigDecimal squareFootage;
} 