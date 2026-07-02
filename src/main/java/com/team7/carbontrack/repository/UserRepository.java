package com.team7.carbontrack.repository;

import com.team7.carbontrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<User> findByProviderIdAndAuthProvider(String providerId, com.team7.carbontrack.entity.AuthProvider authProvider);
}
