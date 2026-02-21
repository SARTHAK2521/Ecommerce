# Use official Java image
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Build project
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run jar
CMD ["java", "-jar", "target/ecommerce-0.0.1-SNAPSHOT.jar"]