# Build stage
FROM maven:3.9.6-eclipse-temurin-17-focal AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -Dmaven.repo.local=/root/.m2/repository

COPY src ./src
RUN mvn package -DskipTests -Dmaven.repo.local=/root/.m2/repository

# Final stage
FROM eclipse-temurin:17-jre-focal

# Install MySQL
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server curl && \
    rm -rf /var/lib/apt/lists/*

# Create MySQL directories
RUN mkdir -p /var/run/mysqld /var/lib/mysql /docker-entrypoint-initdb.d && \
    chown -R mysql:mysql /var/run/mysqld /var/lib/mysql

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

# Create MySQL config
RUN echo '[mysqld]\n\
user=mysql\n\
pid-file=/var/run/mysqld/mysqld.pid\n\
socket=/var/run/mysqld/mysqld.sock\n\
bind-address=0.0.0.0\n\
port=3306\n\
basedir=/usr\n\
datadir=/var/lib/mysql\n\
tmpdir=/tmp\n\
max_connections=20\n\
innodb_buffer_pool_size=64M\n\
key_buffer_size=16M\n\
thread_cache_size=4\n\
query_cache_size=8M\n\
skip-host-cache\n\
skip-name-resolve\n\
' > /etc/mysql/conf.d/mysql.cnf

# Create startup script
COPY <<EOF /app/start.sh
#!/bin/bash
set -e

echo "Setting up MySQL directories..."
mkdir -p /var/run/mysqld /var/lib/mysql
chown -R mysql:mysql /var/run/mysqld /var/lib/mysql /docker-entrypoint-initdb.d
chmod 777 /var/run/mysqld

# Initialize MySQL data directory if needed
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Initializing MySQL data directory..."
    mysqld --initialize-insecure --user=mysql
fi

echo "Starting MySQL server..."
mysqld --user=mysql --console &

# Wait for MySQL to be ready
max_tries=60
count=0
echo "Waiting for MySQL to start..."
until mysql --protocol=socket -uroot -hlocalhost --socket=/var/run/mysqld/mysqld.sock -e "SELECT 1" >/dev/null 2>&1; do
    count=$((count+1))
    if [ $count -ge $max_tries ]; then
        echo "Failed to connect to MySQL after $count attempts"
        exit 1
    fi
    echo "Attempt $count of $max_tries..."
    sleep 2
done

echo "MySQL is up and running"

echo "Configuring MySQL..."
mysql --protocol=socket -uroot -hlocalhost --socket=/var/run/mysqld/mysqld.sock <<-EOSQL
    ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';
    GRANT ALL ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
    GRANT ALL ON *.* TO 'root'@'%' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}' WITH GRANT OPTION;
    FLUSH PRIVILEGES;
    CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE};
EOSQL

echo "Importing database schema..."
mysql --protocol=socket -uroot -p${MYSQL_ROOT_PASSWORD} -hlocalhost --socket=/var/run/mysqld/mysqld.sock ${MYSQL_DATABASE} < /docker-entrypoint-initdb.d/update_password.sql

echo "Starting Spring Boot application..."
exec java -XX:+UseContainerSupport -XX:MaxRAMPercentage=50.0 -Xmx256m -jar app.jar
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