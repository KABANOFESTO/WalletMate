# Build stage
FROM maven:3.9.6-eclipse-temurin-17-focal AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-focal
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Set environment variables
ENV PORT=8081
ENV SPRING_PROFILES_ACTIVE=prod
ENV DB_HOST=localhost
ENV DB_PORT=3306
ENV DB_NAME=walletmate
ENV DB_USERNAME=root
ENV DB_PASSWORD=123456

# Expose port
EXPOSE 8081

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8081/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-Xmx512m", "-Dserver.port=${PORT}", "-Dspring.profiles.active=prod", "-jar", "app.jar"]