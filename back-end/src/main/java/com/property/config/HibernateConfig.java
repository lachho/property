package com.property.config;

import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Hibernate to handle PostgreSQL custom types
 */
@Configuration
public class HibernateConfig {
    // This class is empty for now - we'll use @Enumerated(EnumType.STRING) 
    // and let Hibernate handle the conversion to string values
} 