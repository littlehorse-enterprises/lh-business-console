package io.littlehorse.usertasks.configurations;

import com.c4_soft.springaddons.security.oidc.starter.OpenidProviderPropertiesResolver;
import com.c4_soft.springaddons.security.oidc.starter.properties.SpringAddonsOidcProperties;
import com.c4_soft.springaddons.security.oidc.starter.synchronised.resourceserver.ResourceServerExpressionInterceptUrlRegistryPostProcessor;
import com.c4_soft.springaddons.security.oidc.starter.synchronised.resourceserver.ResourceServerSynchronizedHttpSecurityPostProcessor;
import io.littlehorse.sdk.common.config.LHConfig;
import io.littlehorse.sdk.common.proto.LittleHorseGrpc;
import io.littlehorse.sdk.common.proto.TenantId;
import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Configuration
@EnableMethodSecurity
@EnableWebSecurity
/*
 This configuration is using default auto config for the filterChain. No CSRF protection yet. No session.
*/
public class WebSecurityConfiguration {

    @Bean
    ResourceServerExpressionInterceptUrlRegistryPostProcessor authorizeRequests() {
        String[] publicPaths = {"/config/**", "/api-docs/**", "/swagger-ui/**", "/actuator/**"};
        return auth -> auth.requestMatchers(HttpMethod.GET, publicPaths)
                .permitAll()
                .anyRequest()
                .authenticated();
    }

    @Bean
    ResourceServerSynchronizedHttpSecurityPostProcessor configureResourceServer() {
        // Customize the starter's chain so there is only one catch-all filter chain.
        return http -> http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable);
    }

    @Component
    public static class IssuerStartsWithOpenidProviderPropertiesResolver implements OpenidProviderPropertiesResolver {
        private final SpringAddonsOidcProperties properties;

        public IssuerStartsWithOpenidProviderPropertiesResolver(SpringAddonsOidcProperties properties) {
            this.properties = properties;
        }

        @Override
        public Optional<SpringAddonsOidcProperties.OpenidProviderProperties> resolve(Map<String, Object> claimSet) {
            final var tokenIss = Optional.ofNullable(claimSet.get(JwtClaimNames.ISS))
                    .map(Object::toString)
                    .orElseThrow(() -> new RuntimeException("Invalid token: missing issuer"));
            return properties.getOps().stream()
                    .filter(opProps -> {
                        final var opBaseHref = Optional.ofNullable(opProps.getIss())
                                .map(URI::toString)
                                .orElse(null);
                        if (!StringUtils.hasText(opBaseHref)) {
                            return false;
                        }
                        return tokenIss.startsWith(opBaseHref);
                    })
                    .findAny();
        }
    }

    @Bean
    public Map<String, LittleHorseGrpc.LittleHorseBlockingStub> lhClient(
            IdentityProviderConfigProperties identityProviderConfigProperties) {
        Set<String> configuredTenants = getConfiguredTenants(identityProviderConfigProperties);

        return getPerTenantLHClients(configuredTenants);
    }

    @Bean
    public IdentityProviderConfigProperties identityProviderConfigProperties() {
        return new IdentityProviderConfigProperties();
    }

    private Set<String> getConfiguredTenants(IdentityProviderConfigProperties identityProviderConfigProperties) {
        return identityProviderConfigProperties.getOps().stream()
                .map(CustomIdentityProviderProperties::getTenantId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private Map<String, LittleHorseGrpc.LittleHorseBlockingStub> getPerTenantLHClients(Set<String> configuredTenants) {
        LHConfig lhConfig = new LHConfig();
        String lhServerHost = lhConfig.getApiBootstrapHost();
        int lhServerPort = lhConfig.getApiBootstrapPort();
        Map<String, LittleHorseGrpc.LittleHorseBlockingStub> perTenantClients = new HashMap<>();

        configuredTenants.forEach(tenantIdFromConfig -> {
            TenantId tenantId = TenantId.newBuilder().setId(tenantIdFromConfig).build();
            LittleHorseGrpc.LittleHorseBlockingStub tenantBoundClient =
                    lhConfig.getBlockingStub(lhServerHost, lhServerPort, tenantId);

            perTenantClients.put(tenantIdFromConfig, tenantBoundClient);
        });

        return Collections.unmodifiableMap(perTenantClients);
    }
}
