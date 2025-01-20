# Build stage
FROM maven:3.9.6-eclipse-temurin-17-focal AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-focal
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Copy database initialization script
COPY src/main/resources/db/init.sql /app/init.sql

# Set production profile and default port for Render
ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8081
ENV SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/walletmate?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=123456

# Expose port
EXPOSE 8081

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8081/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-Xmx512m", "-Dserver.port=${PORT}", "-Dspring.profiles.active=prod", "-jar", "app.jar"]