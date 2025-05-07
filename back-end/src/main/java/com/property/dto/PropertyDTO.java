package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDTO {
    private UUID id;
    private String name;
    private String street;
    private String suburb;
    private String state;
    private String postcode;
    private String description;
    private BigDecimal price;
    private Integer beds;
    private Integer baths;
    private Integer area;
    private BigDecimal growthRate;
    private BigDecimal rentalYield;
    private String imageUrl;
    private Set<String> features;
} 