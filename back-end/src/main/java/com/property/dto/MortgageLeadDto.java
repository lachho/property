package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MortgageLeadDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    
    // Optional mortgage details
    private Double loanAmount;
    private Double interestRate;
    private String loanTerm;
    private String repaymentFrequency;
    private String loanType;
} 