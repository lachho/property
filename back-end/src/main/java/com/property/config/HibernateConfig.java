package com.property.config;

import com.property.entity.PostgreSQLEnumType;
import com.property.entity.UserRole;
import org.hibernate.boot.model.TypeContributions;
import org.hibernate.boot.model.TypeContributor;
import org.hibernate.service.ServiceRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Hibernate to handle PostgreSQL custom types
 */
@Configuration
public class HibernateConfig {

    /**
     * Bean to register custom types with Hibernate
     */
    @Bean
    public TypeContributor postgresqlEnumTypeContributor() {
        return new TypeContributor() {
            @Override
            public void contribute(TypeContributions typeContributions, ServiceRegistry serviceRegistry) {
                typeContributions.contributeType(new PostgreSQLEnumType<>(UserRole.class), "user_role");
            }
        };
    }
} 