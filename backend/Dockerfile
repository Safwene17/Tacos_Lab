# Multi-stage build for Spring Boot application
# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven files
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Copy source code
COPY src src

# Build the application (skip tests for faster builds)
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Set JVM options for 512MB RAM environment (Render free tier)
# -Xmx350m: Max heap size (leaves ~150MB for overhead)
# -Xss512k: Stack size per thread
# -XX:MaxMetaspaceSize=100m: Metadata/class definitions
ENV JAVA_TOOL_OPTIONS="-Xmx350m -Xss512k -XX:MaxMetaspaceSize=100m"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
EXPOSE 8080
