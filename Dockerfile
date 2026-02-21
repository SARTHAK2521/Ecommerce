# Use Java 17 image
FROM eclipse-temurin:17-jdk

# Install Maven
RUN apt-get update && apt-get install -y maven

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Build project
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Run jar
CMD ["java", "-jar", "target/ecommerce-0.0.1-SNAPSHOT.jar"]