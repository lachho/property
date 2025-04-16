package com.property.dto;

import com.property.entity.Asset;
import com.property.entity.Liability;
import com.property.entity.Profile;
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
    private Profile profile;
    private List<Asset> assets;
    private List<Liability> liabilities;
} 