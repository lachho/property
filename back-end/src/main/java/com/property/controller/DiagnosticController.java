package com.property.controller;

import com.property.entity.Profile;
import com.property.entity.UserRole;
import com.property.entity.Asset;
import com.property.entity.Liability;
import com.property.repository.ProfileRepository;
import com.property.service.AssetService;
import com.property.service.LiabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for diagnostic endpoints to help troubleshoot API connectivity issues
 */
@RestController
public class DiagnosticController {

    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AssetService assetService;

    @Autowired
    private LiabilityService liabilityService;

    /**
     * Health check endpoint
     * @return Simple health status response
     */
    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "API is healthy");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoint at the root path
     * @return Simple JSON response
     */
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> rootEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Server is running");
        response.put("path", "/");
        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoint for the API root
     * @return Simple JSON response
     */
    @GetMapping("/api")
    public ResponseEntity<Map<String, Object>> apiRootEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "API is accessible");
        response.put("path", "/api");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Test endpoint for auth route without /api prefix
     * @return Simple JSON response
     */
    @GetMapping("/auth/test")
    public ResponseEntity<Map<String, Object>> authDirectEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Auth direct endpoint is accessible");
        response.put("path", "/auth/test");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Test endpoint for auth route with /api prefix
     * @return Simple JSON response
     */
    @GetMapping("/api/auth/test")
    public ResponseEntity<Map<String, Object>> authApiEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Auth API endpoint is accessible");
        response.put("path", "/api/auth/test");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Create a test admin user directly (bypassing normal registration flow)
     * This will properly set up a valid admin user that can be used by the frontend
     * @return Information about the created user
     */
    @PostMapping("/api/test/create-admin")
    public ResponseEntity<Map<String, Object>> createTestAdmin() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("Starting createTestAdmin request");
            
            // Check if test admin already exists
            System.out.println("Checking if admin exists");
            Optional<Profile> existingAdmin = profileRepository.findByEmail("admin@test.com");
            
            if (existingAdmin.isPresent()) {
                System.out.println("Admin exists, updating if needed");
                Profile admin = existingAdmin.get();
                // Update role to ADMIN if needed
                if (admin.getRole() != UserRole.ADMIN) {
                    System.out.println("Updating role to ADMIN");
                    admin.setRole(UserRole.ADMIN);
                    profileRepository.save(admin);
                    response.put("message", "Existing user updated to ADMIN role");
                } else {
                    System.out.println("Admin already has ADMIN role");
                    response.put("message", "Admin user already exists");
                }
                response.put("userId", admin.getId().toString());
                response.put("email", admin.getEmail());
                response.put("role", admin.getRole().name());
                response.put("token", "Use standard login endpoint with admin@test.com / password");
                return ResponseEntity.ok(response);
            }
            
            // Create new admin user with all required fields
            System.out.println("Creating new admin user");
            Profile adminProfile = new Profile();
            
            // Required personal details
            adminProfile.setFirstName("Admin");
            adminProfile.setLastName("User");
            adminProfile.setEmail("admin@test.com");
            adminProfile.setPassword(passwordEncoder.encode("password"));
            adminProfile.setPhone("1234567890");
            adminProfile.setRole(UserRole.ADMIN);
            adminProfile.setCreatedAt(OffsetDateTime.now());
            
            // Required address
            adminProfile.setAddress("123 Test Street, Test City");
            
            // Required occupation details
            adminProfile.setOccupation("System Administrator");
            adminProfile.setEmployer("Property Path");
            adminProfile.setEmploymentLength(5);
            adminProfile.setEmploymentType("FULL_TIME");
            adminProfile.setOnProbation(false);
            adminProfile.setGrossIncome(new BigDecimal("120000"));
            adminProfile.setNonTaxableIncome(new BigDecimal("0"));
            
            // Required partner assessment
            adminProfile.setAssessWithPartner(false);
            adminProfile.setPartnerFirstName("");
            adminProfile.setPartnerLastName("");
            adminProfile.setPartnerMobile("");
            adminProfile.setPartnerAddress("");
            adminProfile.setPartnerEmail("");
            adminProfile.setPartnerOccupation("");
            adminProfile.setPartnerEmployer("");
            adminProfile.setPartnerEmploymentLength(0);
            adminProfile.setPartnerEmploymentType("");
            adminProfile.setPartnerOnProbation(false);
            adminProfile.setPartnerIncome(new BigDecimal("0"));
            adminProfile.setPartnerNonTaxableIncome(new BigDecimal("0"));
            
            // Initialize collections
            adminProfile.setPortfolios(new ArrayList<>());
            adminProfile.setAssets(new ArrayList<>());
            adminProfile.setLiabilities(new ArrayList<>());
            
            // Required expense details
            adminProfile.setIsRenting(false);
            adminProfile.setRentPerWeek(new BigDecimal("0"));
            adminProfile.setMonthlyLivingExpenses(new BigDecimal("2500"));
            adminProfile.setResidenceHistory("Owned current residence for 5 years");
            adminProfile.setDependants(0);
            adminProfile.setDependantsAgeRanges("");
            
            // Required retirement details
            adminProfile.setRetirementPassiveIncomeGoal(new BigDecimal("80000"));
            adminProfile.setDesiredRetirementAge(65);
            
            // Required other fields
            adminProfile.setExistingLoans(new BigDecimal("0"));
            adminProfile.setMaritalStatus("SINGLE");
            
            // Save profile
            System.out.println("Saving admin profile to database");
            Profile savedProfile = profileRepository.save(adminProfile);
            System.out.println("Admin profile saved successfully with ID: " + savedProfile.getId());
            
            response.put("status", "success");
            response.put("message", "Admin user created successfully");
            response.put("userId", savedProfile.getId().toString());
            response.put("email", savedProfile.getEmail());
            response.put("role", savedProfile.getRole().name());
            response.put("instructions", "Use this admin account with the regular login endpoint: admin@test.com / password");
            
            System.out.println("Returning successful response");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in createTestAdmin: " + e.getMessage());
            e.printStackTrace();
            
            response.put("status", "error");
            response.put("message", "Failed to create admin user");
            response.put("error", e.getMessage());
            
            // Add more detailed error information
            if (e.getCause() != null) {
                System.err.println("Cause: " + e.getCause().getMessage());
                response.put("cause", e.getCause().getMessage());
            }
            
            StackTraceElement[] stackTrace = e.getStackTrace();
            if (stackTrace.length > 0) {
                response.put("stackTrace", stackTrace[0].toString());
            }
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Diagnostic info endpoint
     * @return Detailed diagnostic information about the application
     */
    @GetMapping("/api/diagnostic")
    public ResponseEntity<Map<String, Object>> diagnosticInfo() {
        Map<String, Object> response = new HashMap<>();
        
        // Basic server info
        response.put("status", "ok");
        response.put("timestamp", System.currentTimeMillis());
        response.put("javaVersion", System.getProperty("java.version"));
        response.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        response.put("freeMemory", Runtime.getRuntime().freeMemory());
        response.put("maxMemory", Runtime.getRuntime().maxMemory());
        
        // Environment info
        Map<String, String> env = new HashMap<>();
        env.put("SPRING_DATASOURCE_URL", System.getenv("SPRING_DATASOURCE_URL"));
        env.put("SPRING_DATASOURCE_USERNAME", "***REDACTED***");
        env.put("PORT", System.getenv("PORT"));
        env.put("FRONTEND_URL", System.getenv("FRONTEND_URL"));
        response.put("environment", env);
        
        // Database connection info
        try {
            long userCount = profileRepository.count();
            response.put("database", Map.of(
                "connection", "OK",
                "userCount", userCount
            ));
        } catch (Exception e) {
            response.put("database", Map.of(
                "connection", "ERROR",
                "error", e.getMessage()
            ));
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Create a test asset directly
     * @return Information about the created asset
     */
    @PostMapping("/api/test/create-asset")
    public ResponseEntity<Map<String, Object>> createTestAsset() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // First check if we have an admin user
            Optional<Profile> adminUser = profileRepository.findByEmail("admin@test.com");
            if (!adminUser.isPresent()) {
                // Create admin user first
                createTestAdmin();
                adminUser = profileRepository.findByEmail("admin@test.com");
                if (!adminUser.isPresent()) {
                    throw new RuntimeException("Failed to create admin user for asset test");
                }
            }
            
            // Create a test asset
            Asset asset = new Asset();
            asset.setAssetType("TEST_ASSET");
            asset.setCurrentValue(new BigDecimal("150000"));
            asset.setOriginalPrice(new BigDecimal("100000"));
            asset.setYearPurchased(Year.of(2020));
            asset.setOwnershipPercentage(new BigDecimal("100"));
            asset.setIncomeAmount(new BigDecimal("1000"));
            asset.setIncomeFrequency("MONTHLY");
            asset.setDescription("Test asset created via diagnostic endpoint");
            asset.setProfile(adminUser.get());
            
            // Save the asset
            Asset savedAsset = assetService.createAsset(adminUser.get().getId(), asset);
            
            response.put("status", "success");
            response.put("message", "Test asset created successfully");
            response.put("assetId", savedAsset.getId());
            response.put("assetType", savedAsset.getAssetType());
            response.put("profileId", adminUser.get().getId().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to create test asset");
            response.put("error", e.getMessage());
            
            if (e.getCause() != null) {
                response.put("cause", e.getCause().getMessage());
            }
            
            StackTraceElement[] stackTrace = e.getStackTrace();
            if (stackTrace.length > 0) {
                response.put("stackTrace", stackTrace[0].toString());
            }
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Create a test liability directly
     * @return Information about the created liability
     */
    @PostMapping("/api/test/create-liability")
    public ResponseEntity<Map<String, Object>> createTestLiability() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // First check if we have an admin user
            Optional<Profile> adminUser = profileRepository.findByEmail("admin@test.com");
            if (!adminUser.isPresent()) {
                // Create admin user first
                createTestAdmin();
                adminUser = profileRepository.findByEmail("admin@test.com");
                if (!adminUser.isPresent()) {
                    throw new RuntimeException("Failed to create admin user for liability test");
                }
            }
            
            // Create a test liability
            Liability liability = new Liability();
            liability.setLiabilityType("TEST_LIABILITY");
            liability.setLoanBalance(new BigDecimal("50000"));
            liability.setLenderType("BANK");
            liability.setInterestRate(new BigDecimal("4.5"));
            liability.setTermType("YEARS");
            liability.setRepaymentAmount(new BigDecimal("350"));
            liability.setRepaymentFrequency("MONTHLY");
            liability.setLoanType("PERSONAL_LOAN");
            liability.setDescription("Test liability created via diagnostic endpoint");
            liability.setProfile(adminUser.get());
            
            // Save the liability
            Liability savedLiability = liabilityService.createLiability(adminUser.get().getId(), liability);
            
            response.put("status", "success");
            response.put("message", "Test liability created successfully");
            response.put("liabilityId", savedLiability.getId());
            response.put("liabilityType", savedLiability.getLiabilityType());
            response.put("profileId", adminUser.get().getId().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to create test liability");
            response.put("error", e.getMessage());
            
            if (e.getCause() != null) {
                response.put("cause", e.getCause().getMessage());
            }
            
            StackTraceElement[] stackTrace = e.getStackTrace();
            if (stackTrace.length > 0) {
                response.put("stackTrace", stackTrace[0].toString());
            }
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
} 