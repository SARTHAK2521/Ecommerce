# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app
COPY . .

# 👇 move into correct folder
WORKDIR /app/ecommerce/ecommerce

RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY --from=build /app/ecommerce/ecommerce/target/ecommerce-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]