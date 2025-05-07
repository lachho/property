package com.property.controller;

import com.property.entity.Property;
import com.property.repository.PropertyRepository;
import com.property.dto.PropertyCreateRequest;
import com.property.dto.PropertyDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Collections;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    @Autowired
    private PropertyRepository propertyRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PropertyDTO>> getAllProperties() {
        List<Property> properties = propertyRepository.findAll();
        List<PropertyDTO> dtos = properties.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PropertyDTO> createProperty(@RequestBody PropertyCreateRequest request) {
        Property property = new Property();
        property.setName(request.getName());
        property.setStreet(request.getStreet());
        property.setSuburb(request.getSuburb());
        property.setState(request.getState());
        property.setPostcode(request.getPostcode());
        property.setDescription(request.getDescription());
        property.setPrice(request.getPrice());
        property.setBeds(request.getBeds());
        property.setBaths(request.getBaths());
        property.setArea(request.getArea());
        property.setGrowthRate(request.getGrowth_rate());
        property.setRentalYield(request.getRental_yield());
        property.setImageUrl(request.getImage_url());
        property.setFeatures(request.getFeatures());
        Property saved = propertyRepository.save(property);
        return ResponseEntity.ok(toDTO(saved));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<PropertyDTO> getPropertyById(@PathVariable("id") UUID id) {
        return propertyRepository.findById(id)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private PropertyDTO toDTO(Property property) {
        return PropertyDTO.builder()
                .id(property.getId())
                .name(property.getName())
                .street(property.getStreet())
                .suburb(property.getSuburb())
                .state(property.getState())
                .postcode(property.getPostcode())
                .description(property.getDescription())
                .price(property.getPrice())
                .beds(property.getBeds())
                .baths(property.getBaths())
                .area(property.getArea())
                .growthRate(property.getGrowthRate())
                .rentalYield(property.getRentalYield())
                .imageUrl(property.getImageUrl())
                .features(property.getFeatures() != null ? property.getFeatures() : Collections.emptySet())
                .build();
    }
} 