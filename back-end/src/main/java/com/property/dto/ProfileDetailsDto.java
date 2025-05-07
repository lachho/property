package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDetailsDto {
    private ProfileDto profile;
    private List<AssetDTO> assets;
    private List<LiabilityDTO> liabilities;
    private List<PortfolioDTO> portfolios;
} 