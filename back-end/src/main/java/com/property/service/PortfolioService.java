package com.property.service;

import java.util.UUID;

import com.property.dto.PortfolioDTO;
import com.property.dto.PropertyDTO;
import com.property.dto.SimulationRequest;
import com.property.dto.SimulationResponse;
import com.property.entity.Portfolio;

public interface PortfolioService {
    PortfolioDTO getPortfolioByUserId(UUID userId);
    Portfolio createPortfolio(UUID userId);
    PortfolioDTO updatePortfolio(UUID portfolioId, PortfolioDTO portfolioDTO);
    void deletePortfolio(UUID portfolioId);
    Portfolio addPropertyToPortfolio(UUID portfolioId, PropertyDTO propertyDTO);
    Portfolio removePropertyFromPortfolio(UUID portfolioId, UUID propertyId);
    SimulationResponse simulatePropertyImpact(SimulationRequest request);
} 