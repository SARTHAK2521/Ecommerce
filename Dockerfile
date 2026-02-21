FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

COPY . .

# 👇 Move into correct folder
WORKDIR /app/ecommerce

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY --from=build /app/ecommerce/target/ecommerce-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]