package com.property.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "portfolios")
@Data
@NoArgsConstructor
public class Portfolio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Property> properties = new ArrayList<>();

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