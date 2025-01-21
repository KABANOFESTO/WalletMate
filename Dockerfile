# Build stage
FROM maven:3.9.6-eclipse-temurin-17-focal AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -Dmaven.repo.local=/root/.m2/repository

COPY src ./src
RUN mvn package -DskipTests -Dmaven.repo.local=/root/.m2/repository

# Final stage
FROM eclipse-temurin:17-jre-focal

# Install MySQL and configure it
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server curl && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /var/run/mysqld /var/lib/mysql && \
    chown -R mysql:mysql /var/run/mysqld /var/lib/mysql && \
    echo '[mysqld]\nuser=mysql\nbind-address=0.0.0.0\nport=3306\nmax_connections=20\ninnodb_buffer_pool_size=64M\nkey_buffer_size=16M\nthread_cache_size=4\nquery_cache_size=8M\nskip-host-cache\nskip-name-resolve' > /etc/mysql/conf.d/mysql.cnf

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
ENV SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/walletmate?useSSL=false
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=123456

# Create startup script
COPY <<EOF /app/start.sh
#!/bin/bash
set -e

# Initialize MySQL data directory if needed
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Initializing MySQL data directory..."
    mkdir -p /var/lib/mysql
    chown -R mysql:mysql /var/lib/mysql
    mysqld --initialize-insecure --user=mysql
fi

# Create MySQL directories and set permissions
mkdir -p /var/run/mysqld
chown -R mysql:mysql /var/run/mysqld /var/lib/mysql

# Start MySQL in the background
echo "Starting MySQL..."
mysqld --user=mysql &

# Wait for MySQL to be ready
max_tries=30
count=0
echo "Waiting for MySQL to start..."
while ! mysqladmin ping -h localhost --silent; do
    sleep 2
    count=$((count+1))
    if [ $count -ge $max_tries ]; then
        echo "Failed to connect to MySQL after $count attempts"
        exit 1
    fi
    echo "Attempt $count of $max_tries..."
done

# Set root password and create database
echo "Configuring MySQL..."
mysqladmin -u root password "\${MYSQL_ROOT_PASSWORD}"
mysql -u root -p"\${MYSQL_ROOT_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS \${MYSQL_DATABASE};"
mysql -u root -p"\${MYSQL_ROOT_PASSWORD}" \${MYSQL_DATABASE} < /docker-entrypoint-initdb.d/update_password.sql

# Start Spring Boot application with memory constraints
echo "Starting Spring Boot application..."
java -XX:+UseContainerSupport -XX:MaxRAMPercentage=50.0 -Xmx256m -jar app.jar
EOF

RUN chmod +x /app/start.sh

# Create health check script
COPY <<EOF /app/health.sh
#!/bin/bash
if ! pgrep mysqld > /dev/null; then
    echo "MySQL is not running"
    exit 1
fi

if ! curl -f http://0.0.0.0:8081/actuator/health > /dev/null 2>&1; then
    echo "Application is not healthy"
    exit 1
fi

echo "All services are healthy"
exit 0
EOF

RUN chmod +x /app/health.sh

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 CMD [ "/app/health.sh" ]

# Expose ports
EXPOSE 8081 3306

# Run the startup script
CMD ["/app/start.sh"]