package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BorrowingLeadDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    
    // Borrowing capacity details
    private Double grossIncome;
    private Double partnerIncome;
    private Integer dependants;
    private Double existingLoans;
    private String maritalStatus;
    private Double borrowingCapacity;
} 