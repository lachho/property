package com.property.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.Set;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String suburb;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String postcode;

    @Column
    private String description;

    @Column(precision = 19, scale = 2)
    private BigDecimal price;

    @Column
    private Integer beds;

    @Column
    private Integer baths;

    @Column
    private Integer area;

    @Column(name = "growth_rate", precision = 5, scale = 2)
    private BigDecimal growthRate;

    @Column(name = "rental_yield", precision = 5, scale = 2)
    private BigDecimal rentalYield;

    @Column
    private String imageUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "property_features", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "feature")
    private Set<String> features;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id")
    private Portfolio portfolio;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
