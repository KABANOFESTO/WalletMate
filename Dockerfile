# Use OpenJDK 17 as the base image
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy the Maven wrapper files
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make mvnw executable and download dependencies
RUN chmod +x mvnw && \
    ./mvnw dependency:go-offline

# Copy the source code
COPY src ./src/

# Build the application
RUN ./mvnw clean package -DskipTests

# Use a smaller JRE image for the final image
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Environment variables with default values
# Remove database credentials from Dockerfile as they should be set in Render's environment variables
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8081 \
    JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970 \
    JWT_EXPIRATION=86400000 \
    SPRING_MAIL_HOST=smtp.gmail.com \
    SPRING_MAIL_PORT=587 \
    ALLOWED_ORIGINS=https://*.onrender.com,http://localhost:5173,http://127.0.0.1:5501,http://localhost:3000

# Copy the built JAR file from the build stage
COPY --from=0 /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8081

# Run the application with additional JVM options for cloud environment
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-Xmx512m", "-Dserver.port=${PORT:-8081}", "-jar", "app.jar"]