package com.property.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Year;
import java.util.UUID;

@Entity
@Table(name = "assets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asset {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;
    
    // Asset Type: Primary Home, Investment Property, Business, Shares, Super, Savings, Other
    @Column(name = "asset_type", nullable = false)
    private String assetType;
    
    @Column(name = "current_value")
    private BigDecimal currentValue;
    
    @Column(name = "original_price")
    private BigDecimal originalPrice;
    
    @Column(name = "year_purchased")
    private Year yearPurchased;
    
    @Column(name = "ownership_percentage")
    private BigDecimal ownershipPercentage;
    
    @Column(name = "income_amount")
    private BigDecimal incomeAmount;
    
    // Frequency: per week, per month, per fortnight, per year
    @Column(name = "income_frequency")
    private String incomeFrequency;
    
    @Column(name = "description")
    private String description;
} 