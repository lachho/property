package com.property.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "portfolios")
@Getter
@Setter
@NoArgsConstructor
public class Portfolio {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = true)
    private Profile profile;

    @OneToMany(mappedBy = "portfolio")
    private Set<Property> properties = new java.util.HashSet<>();

    @Column(name = "total_value", precision = 19, scale = 2)
    private BigDecimal totalValue = BigDecimal.ZERO;

    @Column(name = "total_debt", precision = 19, scale = 2)
    private BigDecimal totalDebt = BigDecimal.ZERO;

    @Column(name = "total_equity", precision = 19, scale = 2)
    private BigDecimal totalEquity = BigDecimal.ZERO;

    @Column(name = "monthly_cash_flow", precision = 19, scale = 2)
    private BigDecimal monthlyCashFlow = BigDecimal.ZERO;

    @Column(name = "annual_return", precision = 19, scale = 2)
    private BigDecimal annualReturn = BigDecimal.ZERO;
} 