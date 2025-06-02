package com.property.service.impl;

import com.property.dto.MortgageLeadDto;
import com.property.dto.BorrowingLeadDto;
import com.property.dto.ProfileDetailsDto;
import com.property.dto.ProfileDto;
import com.property.entity.Profile;
import com.property.entity.UserRole;
import com.property.repository.AssetRepository;
import com.property.repository.LiabilityRepository;
import com.property.repository.ProfileRepository;
import com.property.service.AssetService;
import com.property.service.LiabilityService;
import com.property.service.ProfileService;
import com.property.dto.AssetDTO;
import com.property.dto.LiabilityDTO;
import com.property.dto.PortfolioDTO;
import com.property.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProfileServiceImpl implements ProfileService {

    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private AssetRepository assetRepository;
    
    @Autowired
    private LiabilityRepository liabilityRepository;
    
    @Autowired
    private AssetService assetService;
    
    @Autowired
    private LiabilityService liabilityService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PortfolioService portfolioService;

    private Profile getProfileEntity(UUID id) {
        return profileRepository.findByIdWithPortfolios(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
    }

    @Override
    public ProfileDto getProfile(UUID id) {
        Profile profile = getProfileEntity(id);
        return toDto(profile);
    }

    @Override
    public List<ProfileDto> getAllProfiles() {
        return profileRepository.findAll().stream().map(this::toDto).toList();
    }

    @Override
    public Profile updateProfile(UUID id, Profile profile) {
        Profile existingProfile = getProfileEntity(id);
        // Update fields that are allowed to be modified
        updateProfileFields(existingProfile, profile);
        return profileRepository.save(existingProfile);
    }

    @Override
    public void deleteProfile(UUID id) {
        profileRepository.deleteById(id);
    }
    
    @Override
    public ProfileDetailsDto getProfileDetails(UUID id) {
        Profile profile = getProfileEntity(id);
        List<AssetDTO> assetDTOs = assetRepository.findByProfileId(id).stream().map(this::toAssetDTO).toList();
        List<LiabilityDTO> liabilityDTOs = liabilityRepository.findByProfileId(id).stream().map(this::toLiabilityDTO).toList();
        List<PortfolioDTO> portfolioDTOs = profile.getPortfolios() != null ?
            profile.getPortfolios().stream().map(this::toPortfolioDTO).toList() : List.of();
        return ProfileDetailsDto.builder()
                .profile(toDto(profile))
                .assets(assetDTOs)
                .liabilities(liabilityDTOs)
                .portfolios(portfolioDTOs)
                .build();
    }
    
    @Override
    @Transactional
    public ProfileDetailsDto updateProfileDetails(UUID id, ProfileDetailsDto profileDetails) {
        // Update profile
        Profile existingProfile = getProfileEntity(id);
        updateProfileFields(existingProfile, toProfileEntity(profileDetails.getProfile()));
        profileRepository.save(existingProfile);
        
        // Delete and recreate assets
        assetRepository.deleteByProfileId(id);
        if (profileDetails.getAssets() != null && !profileDetails.getAssets().isEmpty()) {
            profileDetails.getAssets().forEach(assetDto -> assetService.createAsset(id, toAssetEntity(assetDto)));
        }
        
        // Delete and recreate liabilities
        liabilityRepository.deleteByProfileId(id);
        if (profileDetails.getLiabilities() != null && !profileDetails.getLiabilities().isEmpty()) {
            profileDetails.getLiabilities().forEach(liabilityDto -> liabilityService.createLiability(id, toLiabilityEntity(liabilityDto)));
        }
        
        // Return updated details
        return getProfileDetails(id);
    }
    
    private void updateProfileFields(Profile existingProfile, Profile updatedProfile) {
        // Basic fields
        existingProfile.setFirstName(updatedProfile.getFirstName());
        existingProfile.setLastName(updatedProfile.getLastName());
        existingProfile.setPhone(updatedProfile.getPhone());
        existingProfile.setDateOfBirth(updatedProfile.getDateOfBirth());
        
        // New fields
        existingProfile.setAddress(updatedProfile.getAddress());
        existingProfile.setOccupation(updatedProfile.getOccupation());
        existingProfile.setEmployer(updatedProfile.getEmployer());
        existingProfile.setEmploymentLength(updatedProfile.getEmploymentLength());
        existingProfile.setEmploymentType(updatedProfile.getEmploymentType());
        existingProfile.setOnProbation(updatedProfile.getOnProbation());
        existingProfile.setGrossIncome(updatedProfile.getGrossIncome());
        existingProfile.setNonTaxableIncome(updatedProfile.getNonTaxableIncome());
        
        // Partner fields
        existingProfile.setAssessWithPartner(updatedProfile.getAssessWithPartner());
        existingProfile.setPartnerFirstName(updatedProfile.getPartnerFirstName());
        existingProfile.setPartnerLastName(updatedProfile.getPartnerLastName());
        existingProfile.setPartnerDob(updatedProfile.getPartnerDob());
        existingProfile.setPartnerMobile(updatedProfile.getPartnerMobile());
        existingProfile.setPartnerAddress(updatedProfile.getPartnerAddress());
        existingProfile.setPartnerEmail(updatedProfile.getPartnerEmail());
        existingProfile.setPartnerOccupation(updatedProfile.getPartnerOccupation());
        existingProfile.setPartnerEmployer(updatedProfile.getPartnerEmployer());
        existingProfile.setPartnerEmploymentLength(updatedProfile.getPartnerEmploymentLength());
        existingProfile.setPartnerEmploymentType(updatedProfile.getPartnerEmploymentType());
        existingProfile.setPartnerOnProbation(updatedProfile.getPartnerOnProbation());
        existingProfile.setPartnerIncome(updatedProfile.getPartnerIncome());
        existingProfile.setPartnerNonTaxableIncome(updatedProfile.getPartnerNonTaxableIncome());
        
        // Expense fields
        existingProfile.setIsRenting(updatedProfile.getIsRenting());
        existingProfile.setRentPerWeek(updatedProfile.getRentPerWeek());
        existingProfile.setMonthlyLivingExpenses(updatedProfile.getMonthlyLivingExpenses());
        existingProfile.setResidenceHistory(updatedProfile.getResidenceHistory());
        existingProfile.setDependants(updatedProfile.getDependants());
        existingProfile.setDependantsAgeRanges(updatedProfile.getDependantsAgeRanges());
        
        // Retirement fields
        existingProfile.setRetirementPassiveIncomeGoal(updatedProfile.getRetirementPassiveIncomeGoal());
        existingProfile.setDesiredRetirementAge(updatedProfile.getDesiredRetirementAge());
        
        // Existing fields
        existingProfile.setMaritalStatus(updatedProfile.getMaritalStatus());
        existingProfile.setExistingLoans(updatedProfile.getExistingLoans());
    }

    @Override
    public Profile getProfileByEmail(String email) {
        return profileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile not found with email: " + email));
    }

    @Override
    @Transactional
    public Profile createProfileFromMortgageLead(MortgageLeadDto leadDto) {
        // Check if a profile with this email already exists
        Optional<Profile> existingProfile = profileRepository.findByEmail(leadDto.getEmail());
        
        if (existingProfile.isPresent()) {
            // Update existing profile with lead information
            Profile profile = existingProfile.get();
            profile.setFirstName(leadDto.getFirstName());
            profile.setLastName(leadDto.getLastName());
            profile.setPhone(leadDto.getPhone());
            
            // Update mortgage-related fields if provided
            if (leadDto.getLoanAmount() != null) {
                profile.setExistingLoans(BigDecimal.valueOf(leadDto.getLoanAmount()));
            }
            
            return profileRepository.save(profile);
        } else {
            // Create a new basic profile from lead information
            Profile newProfile = Profile.builder()
                    .firstName(leadDto.getFirstName())
                    .lastName(leadDto.getLastName())
                    .email(leadDto.getEmail())
                    .phone(leadDto.getPhone())
                    .role(UserRole.CLIENT)
                    // Set a default temporary password (should be changed later)
                    .password(passwordEncoder.encode(generateTemporaryPassword()))
                    .build();
            
            // Set mortgage-related fields if provided
            if (leadDto.getLoanAmount() != null) {
                newProfile.setExistingLoans(BigDecimal.valueOf(leadDto.getLoanAmount()));
            }
            
            return profileRepository.save(newProfile);
        }
    }
    
    private String generateTemporaryPassword() {
        // Generate a random temporary password
        return UUID.randomUUID().toString().substring(0, 12);
    }

    @Override
    @Transactional
    public Profile createProfileFromBorrowingLead(BorrowingLeadDto leadDto) {
        // Check if a profile with this email already exists
        Optional<Profile> existingProfile = profileRepository.findByEmail(leadDto.getEmail());
        
        if (existingProfile.isPresent()) {
            // Update existing profile with lead information
            Profile profile = existingProfile.get();
            profile.setFirstName(leadDto.getFirstName());
            profile.setLastName(leadDto.getLastName());
            profile.setPhone(leadDto.getPhone());
            
            // Update borrowing-related fields if provided
            if (leadDto.getGrossIncome() != null) {
                profile.setGrossIncome(BigDecimal.valueOf(leadDto.getGrossIncome()));
            }
            if (leadDto.getExistingLoans() != null) {
                profile.setExistingLoans(BigDecimal.valueOf(leadDto.getExistingLoans()));
            }
            if (leadDto.getMaritalStatus() != null) {
                profile.setMaritalStatus(leadDto.getMaritalStatus());
            }
            
            return profileRepository.save(profile);
        } else {
            // Create a new basic profile from lead information
            Profile newProfile = Profile.builder()
                    .firstName(leadDto.getFirstName())
                    .lastName(leadDto.getLastName())
                    .email(leadDto.getEmail())
                    .phone(leadDto.getPhone())
                    .role(UserRole.CLIENT)
                    // Set a default temporary password (should be changed later)
                    .password(passwordEncoder.encode(generateTemporaryPassword()))
                    .build();
            
            // Set borrowing-related fields if provided
            if (leadDto.getGrossIncome() != null) {
                newProfile.setGrossIncome(BigDecimal.valueOf(leadDto.getGrossIncome()));
            }
            if (leadDto.getExistingLoans() != null) {
                newProfile.setExistingLoans(BigDecimal.valueOf(leadDto.getExistingLoans()));
            }
            if (leadDto.getMaritalStatus() != null) {
                newProfile.setMaritalStatus(leadDto.getMaritalStatus());
            }
            
            return profileRepository.save(newProfile);
        }
    }

    private ProfileDto toDto(Profile profile) {
        if (profile == null) return null;
        return ProfileDto.builder()
                .id(profile.getId())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .email(profile.getEmail())
                .phone(profile.getPhone())
                .role(profile.getRole() != null ? profile.getRole().name() : null)
                .address(profile.getAddress())
                .dateOfBirth(profile.getDateOfBirth() != null ? profile.getDateOfBirth().toString() : null)
                .occupation(profile.getOccupation())
                .employer(profile.getEmployer())
                .employmentLength(profile.getEmploymentLength())
                .employmentType(profile.getEmploymentType())
                .onProbation(profile.getOnProbation())
                .maritalStatus(profile.getMaritalStatus())
                .dependants(profile.getDependants())
                .grossIncome(profile.getGrossIncome())
                .nonTaxableIncome(profile.getNonTaxableIncome())
                // Partner fields
                .assessWithPartner(profile.getAssessWithPartner())
                .partnerFirstName(profile.getPartnerFirstName())
                .partnerLastName(profile.getPartnerLastName())
                .partnerDob(profile.getPartnerDob() != null ? profile.getPartnerDob().toString() : null)
                .partnerMobile(profile.getPartnerMobile())
                .partnerAddress(profile.getPartnerAddress())
                .partnerEmail(profile.getPartnerEmail())
                .partnerOccupation(profile.getPartnerOccupation())
                .partnerEmployer(profile.getPartnerEmployer())
                .partnerEmploymentLength(profile.getPartnerEmploymentLength())
                .partnerEmploymentType(profile.getPartnerEmploymentType())
                .partnerOnProbation(profile.getPartnerOnProbation())
                .partnerIncome(profile.getPartnerIncome())
                .partnerNonTaxableIncome(profile.getPartnerNonTaxableIncome())
                // Expense fields
                .isRenting(profile.getIsRenting())
                .rentPerWeek(profile.getRentPerWeek())
                .monthlyLivingExpenses(profile.getMonthlyLivingExpenses())
                .residenceHistory(profile.getResidenceHistory())
                .dependantsAgeRanges(profile.getDependantsAgeRanges())
                // Retirement fields
                .retirementPassiveIncomeGoal(profile.getRetirementPassiveIncomeGoal())
                .desiredRetirementAge(profile.getDesiredRetirementAge())
                // Other fields
                .existingLoans(profile.getExistingLoans())
                .build();
    }

    private AssetDTO toAssetDTO(com.property.entity.Asset asset) {
        return AssetDTO.builder()
                .id(asset.getId())
                .assetType(asset.getAssetType())
                .currentValue(asset.getCurrentValue())
                .originalPrice(asset.getOriginalPrice())
                .yearPurchased(asset.getYearPurchased())
                .ownershipPercentage(asset.getOwnershipPercentage())
                .incomeAmount(asset.getIncomeAmount())
                .incomeFrequency(asset.getIncomeFrequency())
                .description(asset.getDescription())
                .build();
    }

    private LiabilityDTO toLiabilityDTO(com.property.entity.Liability liability) {
        return LiabilityDTO.builder()
                .id(liability.getId())
                .liabilityType(liability.getLiabilityType())
                .isPrimaryResidence(liability.getIsPrimaryResidence())
                .loanBalance(liability.getLoanBalance())
                .limitAmount(liability.getLimitAmount())
                .lenderType(liability.getLenderType())
                .interestRate(liability.getInterestRate())
                .termType(liability.getTermType())
                .repaymentAmount(liability.getRepaymentAmount())
                .repaymentFrequency(liability.getRepaymentFrequency())
                .loanType(liability.getLoanType())
                .description(liability.getDescription())
                .build();
    }

    private PortfolioDTO toPortfolioDTO(com.property.entity.Portfolio portfolio) {
        return PortfolioDTO.builder()
                .id(portfolio.getId())
                .userId(portfolio.getProfile() != null ? portfolio.getProfile().getId() : null)
                .properties(portfolio.getProperties() != null ?
                    portfolio.getProperties().stream().map(property -> {
                        return com.property.dto.PropertyDTO.builder()
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
                    }).collect(java.util.stream.Collectors.toSet()) : java.util.Collections.emptySet())
                .totalValue(portfolio.getTotalValue())
                .totalDebt(portfolio.getTotalDebt())
                .totalEquity(portfolio.getTotalEquity())
                .monthlyCashFlow(portfolio.getMonthlyCashFlow())
                .annualReturn(portfolio.getAnnualReturn())
                .build();
    }

    private Profile toProfileEntity(ProfileDto dto) {
        if (dto == null) return null;
        Profile profile = new Profile();
        profile.setId(dto.getId());
        profile.setFirstName(dto.getFirstName());
        profile.setLastName(dto.getLastName());
        profile.setEmail(dto.getEmail());
        profile.setPhone(dto.getPhone());
        profile.setRole(dto.getRole() != null ? com.property.entity.UserRole.valueOf(dto.getRole()) : null);
        profile.setAddress(dto.getAddress());
        profile.setDateOfBirth(dto.getDateOfBirth() != null ? java.time.LocalDate.parse(dto.getDateOfBirth()) : null);
        profile.setOccupation(dto.getOccupation());
        profile.setEmployer(dto.getEmployer());
        profile.setEmploymentLength(dto.getEmploymentLength());
        profile.setEmploymentType(dto.getEmploymentType());
        profile.setOnProbation(dto.getOnProbation());
        profile.setMaritalStatus(dto.getMaritalStatus());
        profile.setDependants(dto.getDependants());
        profile.setGrossIncome(dto.getGrossIncome());
        profile.setNonTaxableIncome(dto.getNonTaxableIncome());
        // Partner fields
        profile.setAssessWithPartner(dto.getAssessWithPartner());
        profile.setPartnerFirstName(dto.getPartnerFirstName());
        profile.setPartnerLastName(dto.getPartnerLastName());
        profile.setPartnerDob(dto.getPartnerDob() != null ? java.time.LocalDate.parse(dto.getPartnerDob()) : null);
        profile.setPartnerMobile(dto.getPartnerMobile());
        profile.setPartnerAddress(dto.getPartnerAddress());
        profile.setPartnerEmail(dto.getPartnerEmail());
        profile.setPartnerOccupation(dto.getPartnerOccupation());
        profile.setPartnerEmployer(dto.getPartnerEmployer());
        profile.setPartnerEmploymentLength(dto.getPartnerEmploymentLength());
        profile.setPartnerEmploymentType(dto.getPartnerEmploymentType());
        profile.setPartnerOnProbation(dto.getPartnerOnProbation());
        profile.setPartnerIncome(dto.getPartnerIncome());
        profile.setPartnerNonTaxableIncome(dto.getPartnerNonTaxableIncome());
        // Expense fields
        profile.setIsRenting(dto.getIsRenting());
        profile.setRentPerWeek(dto.getRentPerWeek());
        profile.setMonthlyLivingExpenses(dto.getMonthlyLivingExpenses());
        profile.setResidenceHistory(dto.getResidenceHistory());
        profile.setDependantsAgeRanges(dto.getDependantsAgeRanges());
        // Retirement fields
        profile.setRetirementPassiveIncomeGoal(dto.getRetirementPassiveIncomeGoal());
        profile.setDesiredRetirementAge(dto.getDesiredRetirementAge());
        // Other fields
        profile.setExistingLoans(dto.getExistingLoans());
        return profile;
    }

    private com.property.entity.Asset toAssetEntity(AssetDTO dto) {
        if (dto == null) return null;
        com.property.entity.Asset asset = new com.property.entity.Asset();
        asset.setId(dto.getId());
        asset.setAssetType(dto.getAssetType());
        asset.setCurrentValue(dto.getCurrentValue());
        asset.setOriginalPrice(dto.getOriginalPrice());
        asset.setYearPurchased(dto.getYearPurchased());
        asset.setOwnershipPercentage(dto.getOwnershipPercentage());
        asset.setIncomeAmount(dto.getIncomeAmount());
        asset.setIncomeFrequency(dto.getIncomeFrequency());
        asset.setDescription(dto.getDescription());
        return asset;
    }

    private com.property.entity.Liability toLiabilityEntity(LiabilityDTO dto) {
        if (dto == null) return null;
        com.property.entity.Liability liability = new com.property.entity.Liability();
        liability.setId(dto.getId());
        liability.setLiabilityType(dto.getLiabilityType());
        liability.setIsPrimaryResidence(dto.getIsPrimaryResidence());
        liability.setLoanBalance(dto.getLoanBalance());
        liability.setLimitAmount(dto.getLimitAmount());
        liability.setLenderType(dto.getLenderType());
        liability.setInterestRate(dto.getInterestRate());
        liability.setTermType(dto.getTermType());
        liability.setRepaymentAmount(dto.getRepaymentAmount());
        liability.setRepaymentFrequency(dto.getRepaymentFrequency());
        liability.setLoanType(dto.getLoanType());
        liability.setDescription(dto.getDescription());
        return liability;
    }
} 