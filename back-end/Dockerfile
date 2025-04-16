FROM maven:3.8.7-eclipse-temurin-17

WORKDIR /app

# Only copy POM file to cache dependencies
COPY pom.xml .

# Install Maven dependencies (this layer is cached if pom.xml doesn't change)
RUN mvn dependency:go-offline

# Set Spring profiles
ENV SPRING_PROFILES_ACTIVE=dev

# Add Spring Boot DevTools support
ENV SPRING_DEVTOOLS_RESTART_ENABLED=true
ENV SPRING_DEVTOOLS_ADD_PROPERTIES=true

# Expose port
EXPOSE 8080

# Run the application with Spring Boot DevTools enabled for hot reloading
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments='-XX:TieredStopAtLevel=1'"] 