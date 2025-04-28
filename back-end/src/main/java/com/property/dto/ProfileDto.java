package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private String address;
    private String dateOfBirth;
    private String occupation;
    private String employer;
    private Integer employmentLength;
    private String employmentType;
    private Boolean onProbation;
    private String maritalStatus;
    private Integer dependants;
    // Add other primitive/simple fields as needed
} 