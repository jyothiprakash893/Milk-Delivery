FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/delivery-service-*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
