package com.property.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "properties")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(name = "zip_code", nullable = false)
    private String zipCode;

    @Column(name = "purchase_price", precision = 19, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "current_value", precision = 19, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "mortgage_amount", precision = 19, scale = 2)
    private BigDecimal mortgageAmount;

    @Column(name = "monthly_rent", precision = 19, scale = 2)
    private BigDecimal monthlyRent;

    @Column(name = "monthly_expenses", precision = 19, scale = 2)
    private BigDecimal monthlyExpenses;

    @Column(name = "monthly_cash_flow", precision = 19, scale = 2)
    private BigDecimal monthlyCashFlow;

    @Column(name = "annual_return", precision = 19, scale = 2)
    private BigDecimal annualReturn;

    @Column(name = "year_built")
    private Integer yearBuilt;

    private Integer bedrooms;
    private Integer bathrooms;

    @Column(name = "square_footage", precision = 19, scale = 2)
    private BigDecimal squareFootage;

    // Existing fields (from previous version)
    private String description;
    private String imageUrl;
    private BigDecimal growthRate;
    private BigDecimal rentalYield;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ElementCollection
    @CollectionTable(name = "property_features", joinColumns = @JoinColumn(name = "property_id"))
    private Set<String> features;

    @ManyToMany(mappedBy = "properties")
    private Set<Portfolio> portfolios;

    // Lifecycle callback
    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    // Updated copy method to include all fields
    public Property copy() {
        return Property.builder()
                .id(this.id)
                .address(this.address)
                .city(this.city)
                .state(this.state)
                .zipCode(this.zipCode)
                .purchasePrice(this.purchasePrice)
                .currentValue(this.currentValue)
                .mortgageAmount(this.mortgageAmount)
                .monthlyRent(this.monthlyRent)
                .monthlyExpenses(this.monthlyExpenses)
                .monthlyCashFlow(this.monthlyCashFlow)
                .annualReturn(this.annualReturn)
                .yearBuilt(this.yearBuilt)
                .bedrooms(this.bedrooms)
                .bathrooms(this.bathrooms)
                .squareFootage(this.squareFootage)
                .description(this.description)
                .imageUrl(this.imageUrl)
                .growthRate(this.growthRate)
                .rentalYield(this.rentalYield)
                .features(Set.copyOf(this.features))
                .build();
    }

    // Calculation methods matching service logic
    public BigDecimal calculateCapRate() {
        if (currentValue == null || currentValue.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal annualNetOperatingIncome = monthlyRent.multiply(BigDecimal.valueOf(12))
                .subtract(monthlyExpenses.multiply(BigDecimal.valueOf(12)));
        return annualNetOperatingIncome.divide(currentValue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    public BigDecimal calculateCashOnCashReturn(BigDecimal downPayment) {
        if (downPayment == null || downPayment.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal annualCashFlow = monthlyCashFlow.multiply(BigDecimal.valueOf(12));
        return annualCashFlow.divide(downPayment, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}
