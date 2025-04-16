package com.property.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
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

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
