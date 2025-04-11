package com.property.repository;

import com.property.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    @Query("SELECT p FROM Portfolio p LEFT JOIN FETCH p.properties WHERE p.user.id = :userId")
    Optional<Portfolio> findByUserIdWithProperties(@Param("userId") Long userId);
} 