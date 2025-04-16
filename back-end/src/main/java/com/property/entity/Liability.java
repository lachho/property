package com.property.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "liabilities")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Liability {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;
    
    // Liability Type: Mortgage, Credit Card, Vehicle Loan, HECS, Childcare, School, Insurance, Private Health, Other Loans, Share Margin Lending
    @Column(name = "liability_type", nullable = false)
    private String liabilityType;
    
    // For mortgages: whether it's for primary residence or investment
    @Column(name = "is_primary_residence")
    private Boolean isPrimaryResidence;
    
    @Column(name = "loan_balance")
    private BigDecimal loanBalance;
    
    @Column(name = "limit_amount")
    private BigDecimal limitAmount;
    
    @Column(name = "lender_type")
    private String lenderType;
    
    @Column(name = "interest_rate")
    private BigDecimal interestRate;
    
    // Term Type: Fixed or Variable
    @Column(name = "term_type")
    private String termType;
    
    @Column(name = "repayment_amount")
    private BigDecimal repaymentAmount;
    
    // Frequency: Weekly, Fortnightly, Monthly
    @Column(name = "repayment_frequency")
    private String repaymentFrequency;
    
    // Loan Type: Interest Only or Principal and Interest
    @Column(name = "loan_type")
    private String loanType;
    
    @Column(name = "description")
    private String description;
} 