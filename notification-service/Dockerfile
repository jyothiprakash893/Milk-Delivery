FROM eclipse-temurin:17-jdk-alpine
LABEL maintainer="milkdelivery"

WORKDIR /app

COPY target/notification-service-*.jar app.jar

EXPOSE 8086

ENTRYPOINT ["java", "-jar", "app.jar"]
