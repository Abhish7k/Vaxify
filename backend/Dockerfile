# Build stage
FROM maven:3.9.16-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# Run stage — sized for Render free (512MB). New Relic is omitted so the
# JVM has enough headroom; S3 / Aiven / Brevo stay as env-configured services.
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S vaxify && adduser -S vaxify -G vaxify
COPY --from=build --chown=vaxify:vaxify /app/target/*.jar app.jar
USER vaxify

EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["java", "-jar", "app.jar"]
