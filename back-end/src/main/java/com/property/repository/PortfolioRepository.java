package com.property.repository;

import com.property.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
    @Query("SELECT p FROM Portfolio p LEFT JOIN FETCH p.properties WHERE p.profile.id = :userId")
    Optional<Portfolio> findByUserIdWithProperties(@Param("userId") UUID userId);
} 