package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Year;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetDTO {
    private UUID id;
    private String assetType;
    private BigDecimal currentValue;
    private BigDecimal originalPrice;
    private Year yearPurchased;
    private BigDecimal ownershipPercentage;
    private BigDecimal incomeAmount;
    private String incomeFrequency;
    private String description;
} 