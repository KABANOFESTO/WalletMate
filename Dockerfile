# Build stage
FROM maven:3.9.6-eclipse-temurin-17-focal AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package -DskipTests

# Final stage
FROM eclipse-temurin:17-jre-focal

# Install MySQL
RUN apt-get update && \
    apt-get install -y mysql-server && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /var/run/mysqld && \
    chown -R mysql:mysql /var/run/mysqld

# Copy MySQL initialization script
COPY update_password.sql /docker-entrypoint-initdb.d/

# Set MySQL environment variables
ENV MYSQL_ROOT_PASSWORD=123456
ENV MYSQL_DATABASE=walletmate

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Set environment variables
ENV PORT=8081
ENV SPRING_PROFILES_ACTIVE=prod
ENV SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/walletmate
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=123456

# Expose port
EXPOSE 8081 3306

# Create startup script
COPY <<EOF /app/start.sh
#!/bin/bash
service mysql start
mysql -u root -p\${MYSQL_ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS \${MYSQL_DATABASE};"
mysql -u root -p\${MYSQL_ROOT_PASSWORD} \${MYSQL_DATABASE} < /docker-entrypoint-initdb.d/update_password.sql
java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar app.jar
EOF

RUN chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]