package com.property.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    // Personal Details
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "email", nullable = false, unique = true)
    private String email;
    
    @Column(name = "password", nullable = false)
    private String password;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
    
    // Using custom PostgreSQL enum type mapping
    @Column(name = "role", nullable = false, columnDefinition = "user_role")
    private UserRole role = UserRole.CLIENT;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    // Occupation Details
    @Column(name = "occupation")
    private String occupation;
    
    @Column(name = "employer")
    private String employer;
    
    @Column(name = "employment_length")
    private Integer employmentLength;
    
    @Column(name = "employment_type")
    private String employmentType;
    
    @Column(name = "on_probation")
    private Boolean onProbation;
    
    @Column(name = "gross_income")
    private BigDecimal grossIncome;
    
    @Column(name = "non_taxable_income")
    private BigDecimal nonTaxableIncome;
    
    // Partner Assessment Toggle
    @Column(name = "assess_with_partner")
    private Boolean assessWithPartner;
    
    // Partner Details
    @Column(name = "partner_first_name")
    private String partnerFirstName;
    
    @Column(name = "partner_last_name")
    private String partnerLastName;
    
    @Column(name = "partner_dob")
    private LocalDate partnerDob;
    
    @Column(name = "partner_mobile")
    private String partnerMobile;
    
    @Column(name = "partner_address")
    private String partnerAddress;
    
    @Column(name = "partner_email")
    private String partnerEmail;
    
    @Column(name = "partner_occupation")
    private String partnerOccupation;
    
    @Column(name = "partner_employer")
    private String partnerEmployer;
    
    @Column(name = "partner_employment_length")
    private Integer partnerEmploymentLength;
    
    @Column(name = "partner_employment_type")
    private String partnerEmploymentType;
    
    @Column(name = "partner_on_probation")
    private Boolean partnerOnProbation;
    
    @Column(name = "partner_income")
    private BigDecimal partnerIncome;
    
    @Column(name = "partner_non_taxable_income")
    private BigDecimal partnerNonTaxableIncome;
    
    // Expense Details
    @Column(name = "is_renting")
    private Boolean isRenting;
    
    @Column(name = "rent_per_week")
    private BigDecimal rentPerWeek;
    
    @Column(name = "monthly_living_expenses")
    private BigDecimal monthlyLivingExpenses;
    
    @Column(name = "residence_history", columnDefinition = "TEXT")
    private String residenceHistory;
    
    @Column(name = "dependants")
    private Integer dependants;
    
    @Column(name = "dependants_age_ranges", columnDefinition = "TEXT")
    private String dependantsAgeRanges;
    
    // Retirement Details
    @Column(name = "retirement_passive_income_goal")
    private BigDecimal retirementPassiveIncomeGoal;
    
    @Column(name = "desired_retirement_age")
    private Integer desiredRetirementAge;
    
    // Existing loans
    @Column(name = "existing_loans")
    private BigDecimal existingLoans;
    
    @Column(name = "marital_status")
    private String maritalStatus;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Portfolio> portfolios = new ArrayList<>();
    
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Asset> assets = new ArrayList<>();
    
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Liability> liabilities = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}