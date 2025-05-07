package com.property.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Set;

@Data
public class PropertyCreateRequest {
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
    private BigDecimal growth_rate;
    private BigDecimal rental_yield;
    private String image_url;
    private Set<String> features;
} 