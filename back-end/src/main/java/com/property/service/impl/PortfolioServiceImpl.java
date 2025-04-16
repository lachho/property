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
import java.math.RoundingMode;
import java.util.stream.Collectors;
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
                .collect(Collectors.toList()));

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
        BigDecimal totalValue = BigDecimal.ZERO;
        BigDecimal totalDebt = BigDecimal.ZERO;
        BigDecimal totalMonthlyCashFlow = BigDecimal.ZERO;

        for (Property property : portfolio.getProperties()) {
            totalValue = totalValue.add(property.getCurrentValue());
            totalDebt = totalDebt.add(property.getMortgageAmount());
            totalMonthlyCashFlow = totalMonthlyCashFlow.add(property.getMonthlyCashFlow());
        }

        portfolio.setTotalValue(totalValue);
        portfolio.setTotalDebt(totalDebt);
        portfolio.setTotalEquity(totalValue.subtract(totalDebt));
        portfolio.setMonthlyCashFlow(totalMonthlyCashFlow);
        portfolio.setAnnualReturn(calculateAnnualReturn(portfolio));
    }

    private BigDecimal calculateAnnualReturn(Portfolio portfolio) {
        if (portfolio.getTotalValue().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return portfolio.getMonthlyCashFlow()
                .multiply(BigDecimal.valueOf(12))
                .divide(portfolio.getTotalValue(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    private BigDecimal calculateCashOnCashReturn(Property property, SimulationRequest request) {
        BigDecimal annualCashFlow = property.getMonthlyCashFlow().multiply(BigDecimal.valueOf(12));
        return annualCashFlow.divide(request.getDownPayment(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    private BigDecimal calculateCapRate(Property property) {
        BigDecimal annualNetOperatingIncome = property.getMonthlyRent()
                .multiply(BigDecimal.valueOf(12))
                .subtract(property.getMonthlyExpenses().multiply(BigDecimal.valueOf(12)));
        return annualNetOperatingIncome.divide(property.getCurrentValue(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    private BigDecimal calculateDebtToIncomeRatio(Portfolio portfolio) {
        BigDecimal annualIncome = portfolio.getMonthlyCashFlow().multiply(BigDecimal.valueOf(12));
        if (annualIncome.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return portfolio.getTotalDebt().divide(annualIncome, 4, RoundingMode.HALF_UP);
    }

    private Property copyProperty(Property original) {
        Property copy = new Property();
        copy.setAddress(original.getAddress());
        copy.setCity(original.getCity());
        copy.setState(original.getState());
        copy.setZipCode(original.getZipCode());
        copy.setPurchasePrice(original.getPurchasePrice());
        copy.setCurrentValue(original.getCurrentValue());
        copy.setMortgageAmount(original.getMortgageAmount());
        copy.setMonthlyRent(original.getMonthlyRent());
        copy.setMonthlyExpenses(original.getMonthlyExpenses());
        copy.setMonthlyCashFlow(original.getMonthlyCashFlow());
        copy.setAnnualReturn(original.getAnnualReturn());
        copy.setYearBuilt(original.getYearBuilt());
        copy.setBedrooms(original.getBedrooms());
        copy.setBathrooms(original.getBathrooms());
        copy.setSquareFootage(original.getSquareFootage());
        return copy;
    }

    private PortfolioDTO convertToDTO(Portfolio portfolio) {
        return PortfolioDTO.builder()
                .id(portfolio.getId())
                .userId(portfolio.getProfile().getId())
                .properties(portfolio.getProperties().stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList()))
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
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .zipCode(property.getZipCode())
                .purchasePrice(property.getPurchasePrice())
                .currentValue(property.getCurrentValue())
                .mortgageAmount(property.getMortgageAmount())
                .monthlyRent(property.getMonthlyRent())
                .monthlyExpenses(property.getMonthlyExpenses())
                .monthlyCashFlow(property.getMonthlyCashFlow())
                .annualReturn(property.getAnnualReturn())
                .yearBuilt(property.getYearBuilt())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .squareFootage(property.getSquareFootage())
                .build();
    }

    private Property convertToEntity(PropertyDTO dto) {
        Property property = new Property();
        property.setAddress(dto.getAddress());
        property.setCity(dto.getCity());
        property.setState(dto.getState());
        property.setZipCode(dto.getZipCode());
        property.setPurchasePrice(dto.getPurchasePrice());
        property.setCurrentValue(dto.getCurrentValue());
        property.setMortgageAmount(dto.getMortgageAmount());
        property.setMonthlyRent(dto.getMonthlyRent());
        property.setMonthlyExpenses(dto.getMonthlyExpenses());
        property.setMonthlyCashFlow(dto.getMonthlyCashFlow());
        property.setAnnualReturn(dto.getAnnualReturn());
        property.setYearBuilt(dto.getYearBuilt());
        property.setBedrooms(dto.getBedrooms());
        property.setBathrooms(dto.getBathrooms());
        property.setSquareFootage(dto.getSquareFootage());
        return property;
    }
} 