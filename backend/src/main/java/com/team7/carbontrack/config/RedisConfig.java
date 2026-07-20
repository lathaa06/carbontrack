package com.team7.carbontrack.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team7.carbontrack.dto.DashboardSummary;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.Map;

@Configuration
public class RedisConfig {

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer(
            ObjectMapper objectMapper) {
        GenericJackson2JsonRedisSerializer serializer =
                new GenericJackson2JsonRedisSerializer(objectMapper);

        RedisCacheConfiguration config =
                RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofMinutes(10))
                        .disableCachingNullValues()
                        .serializeValuesWith(
                                RedisSerializationContext.SerializationPair
                                        .fromSerializer(serializer)
                        );

        Jackson2JsonRedisSerializer<DashboardSummary> dashboardSerializer =
                new Jackson2JsonRedisSerializer<>(objectMapper, DashboardSummary.class);

        RedisCacheConfiguration dashboardConfig = config
                .entryTtl(Duration.ofMinutes(5))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(dashboardSerializer)
                );

        return builder -> builder
                .cacheDefaults(config)
                .withInitialCacheConfigurations(Map.of(
                        "dashboardSummary", dashboardConfig
                ));
    }
}
