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
public class ProfileDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private String address;
    private String dateOfBirth;
    private String occupation;
    private String employer;
    private Integer employmentLength;
    private String employmentType;
    private Boolean onProbation;
    private String maritalStatus;
    private Integer dependants;
    private BigDecimal grossIncome;
    private BigDecimal nonTaxableIncome;
    
    // Partner fields
    private Boolean assessWithPartner;
    private String partnerFirstName;
    private String partnerLastName;
    private String partnerDob;
    private String partnerMobile;
    private String partnerAddress;
    private String partnerEmail;
    private String partnerOccupation;
    private String partnerEmployer;
    private Integer partnerEmploymentLength;
    private String partnerEmploymentType;
    private Boolean partnerOnProbation;
    private BigDecimal partnerIncome;
    private BigDecimal partnerNonTaxableIncome;
    
    // Expense fields
    private Boolean isRenting;
    private BigDecimal rentPerWeek;
    private BigDecimal monthlyLivingExpenses;
    private String residenceHistory;
    private String dependantsAgeRanges;
    
    // Retirement fields
    private BigDecimal retirementPassiveIncomeGoal;
    private Integer desiredRetirementAge;
    
    // Other fields
    private BigDecimal existingLoans;
} 