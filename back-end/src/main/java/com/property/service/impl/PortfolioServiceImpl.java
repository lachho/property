package com.property.service.impl;

import com.property.dto.PortfolioDTO;
import com.property.dto.PropertyDTO;
import com.property.dto.SimulationRequest;
import com.property.dto.SimulationResponse;
import com.property.entity.Portfolio;
import com.property.entity.Property;
import com.property.repository.PortfolioRepository;
import com.property.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioRepository portfolioRepository;

    @Override
    public Portfolio createPortfolio(UUID userId) {
        Portfolio portfolio = new Portfolio();
        portfolio.setId(userId);
        return portfolioRepository.save(portfolio);
    }

    @Override
    public PortfolioDTO updatePortfolio(UUID portfolioId, PortfolioDTO portfolioDTO) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        // Update portfolio fields
        return convertToDTO(portfolioRepository.save(portfolio));
    }

    @Override
    public void deletePortfolio(UUID portfolioId) {
        portfolioRepository.deleteById(portfolioId);
    }

    @Override
    public Portfolio addPropertyToPortfolio(UUID portfolioId, PropertyDTO propertyDTO) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        Property property = convertToEntity(propertyDTO);
        portfolio.getProperties().add(property);
        return portfolioRepository.save(portfolio);
    }

    @Override
    public Portfolio removePropertyFromPortfolio(UUID portfolioId, UUID propertyId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        portfolio.getProperties().removeIf(p -> p.getId().equals(propertyId));
        return portfolioRepository.save(portfolio);
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioDTO getPortfolioByUserId(UUID userId) {
        return portfolioRepository.findByUserIdWithProperties(userId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Portfolio not found for user: " + userId));
    }

    @Override
    @Transactional
    public SimulationResponse simulatePropertyImpact(SimulationRequest request) {
        Portfolio currentPortfolio = portfolioRepository.findById(request.getPortfolioId())
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        // Create a copy of the current portfolio for simulation
        Portfolio projectedPortfolio = new Portfolio();
        projectedPortfolio.setProperties(currentPortfolio.getProperties().stream()
                .map(this::copyProperty)
                .collect(java.util.stream.Collectors.toSet()));

        // Add the new property to the projected portfolio
        Property newProperty = convertToEntity(request.getNewProperty());
        projectedPortfolio.getProperties().add(newProperty);

        // Calculate portfolio metrics
        calculatePortfolioMetrics(projectedPortfolio);

        // Calculate changes
        BigDecimal monthlyCashFlowChange = projectedPortfolio.getMonthlyCashFlow()
                .subtract(currentPortfolio.getMonthlyCashFlow());
        BigDecimal annualReturnChange = projectedPortfolio.getAnnualReturn()
                .subtract(currentPortfolio.getAnnualReturn());

        return SimulationResponse.builder()
                .currentPortfolio(convertToDTO(currentPortfolio))
                .projectedPortfolio(convertToDTO(projectedPortfolio))
                .monthlyCashFlowChange(monthlyCashFlowChange)
                .annualReturnChange(annualReturnChange)
                .totalValueChange(projectedPortfolio.getTotalValue().subtract(currentPortfolio.getTotalValue()))
                .totalDebtChange(projectedPortfolio.getTotalDebt().subtract(currentPortfolio.getTotalDebt()))
                .totalEquityChange(projectedPortfolio.getTotalEquity().subtract(currentPortfolio.getTotalEquity()))
                .cashOnCashReturn(calculateCashOnCashReturn(newProperty, request))
                .capRate(calculateCapRate(newProperty))
                .debtToIncomeRatio(calculateDebtToIncomeRatio(projectedPortfolio))
                .build();
    }

    private void calculatePortfolioMetrics(Portfolio portfolio) {
        // TODO: Redefine metrics based on new property fields
        portfolio.setTotalValue(BigDecimal.ZERO);
        portfolio.setTotalDebt(BigDecimal.ZERO);
        portfolio.setTotalEquity(BigDecimal.ZERO);
        portfolio.setMonthlyCashFlow(BigDecimal.ZERO);
        portfolio.setAnnualReturn(BigDecimal.ZERO);
    }

    private BigDecimal calculateAnnualReturn(Portfolio portfolio) {
        // TODO: Redefine annual return calculation based on new property fields
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateCashOnCashReturn(Property property, SimulationRequest request) {
        // TODO: Redefine cash on cash return calculation based on new property fields
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateCapRate(Property property) {
        // TODO: Redefine cap rate calculation based on new property fields
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateDebtToIncomeRatio(Portfolio portfolio) {
        // TODO: Redefine debt to income ratio calculation based on new property fields
        return BigDecimal.ZERO;
    }

    private Property copyProperty(Property original) {
        Property copy = new Property();
        copy.setName(original.getName());
        copy.setStreet(original.getStreet());
        copy.setSuburb(original.getSuburb());
        copy.setState(original.getState());
        copy.setPostcode(original.getPostcode());
        copy.setDescription(original.getDescription());
        copy.setPrice(original.getPrice());
        copy.setBeds(original.getBeds());
        copy.setBaths(original.getBaths());
        copy.setArea(original.getArea());
        copy.setGrowthRate(original.getGrowthRate());
        copy.setRentalYield(original.getRentalYield());
        copy.setImageUrl(original.getImageUrl());
        copy.setFeatures(original.getFeatures());
        return copy;
    }

    private PortfolioDTO convertToDTO(Portfolio portfolio) {
        return PortfolioDTO.builder()
                .id(portfolio.getId())
                .userId(portfolio.getProfile().getId())
                .properties(portfolio.getProperties().stream()
                        .map(this::convertToDTO)
                        .collect(java.util.stream.Collectors.toSet()))
                .totalValue(portfolio.getTotalValue())
                .totalDebt(portfolio.getTotalDebt())
                .totalEquity(portfolio.getTotalEquity())
                .monthlyCashFlow(portfolio.getMonthlyCashFlow())
                .annualReturn(portfolio.getAnnualReturn())
                .build();
    }

    private PropertyDTO convertToDTO(Property property) {
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
                .features(property.getFeatures())
                .build();
    }

    private Property convertToEntity(PropertyDTO dto) {
        Property property = new Property();
        property.setName(dto.getName());
        property.setStreet(dto.getStreet());
        property.setSuburb(dto.getSuburb());
        property.setState(dto.getState());
        property.setPostcode(dto.getPostcode());
        property.setDescription(dto.getDescription());
        property.setPrice(dto.getPrice());
        property.setBeds(dto.getBeds());
        property.setBaths(dto.getBaths());
        property.setArea(dto.getArea());
        property.setGrowthRate(dto.getGrowthRate());
        property.setRentalYield(dto.getRentalYield());
        property.setImageUrl(dto.getImageUrl());
        property.setFeatures(dto.getFeatures());
        return property;
    }
} 