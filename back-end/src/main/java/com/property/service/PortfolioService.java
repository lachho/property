package com.property.service;

import com.property.dto.PortfolioDTO;
import com.property.dto.PropertyDTO;
import com.property.dto.SimulationRequest;
import com.property.dto.SimulationResponse;

public interface PortfolioService {
    PortfolioDTO getPortfolioByUserId(Long userId);
    PortfolioDTO createPortfolio(Long userId);
    PortfolioDTO updatePortfolio(Long portfolioId, PortfolioDTO portfolioDTO);
    void deletePortfolio(Long portfolioId);
    PortfolioDTO addPropertyToPortfolio(Long portfolioId, PropertyDTO propertyDTO);
    PortfolioDTO removePropertyFromPortfolio(Long portfolioId, Long propertyId);
    SimulationResponse simulatePropertyImpact(SimulationRequest request);
} 