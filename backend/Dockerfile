# Build stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Download New Relic agent
RUN wget -O newrelic.zip https://download.newrelic.com/newrelic/java-agent/newrelic-agent/current/newrelic-java.zip && \
    unzip newrelic.zip && \
    rm newrelic.zip

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
COPY --from=build /app/newrelic/newrelic.jar newrelic.jar
EXPOSE 8080
ENTRYPOINT ["java", "-javaagent:newrelic.jar", "-jar", "app.jar"]
