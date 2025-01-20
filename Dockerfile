# Build stage
FROM maven:3.9.6-eclipse-temurin-17-focal AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-focal
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Set production profile
ENV SPRING_PROFILES_ACTIVE=prod

# Expose port
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-Xmx512m", "-Dserver.port=${PORT:-8081}", "-Dspring.profiles.active=prod", "-jar", "app.jar"]