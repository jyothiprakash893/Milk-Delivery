package com.milkdelivery.notification.entity;

import java.time.LocalDateTime;

public class NotificationLog {

    private Long id;
    private Long customerId;
    private String type;
    private String message;
    private LocalDateTime sentAt;
    private String status;

    public NotificationLog() {
    }

    public NotificationLog(Long id, Long customerId, String type, String message, LocalDateTime sentAt, String status) {
        this.id = id;
        this.customerId = customerId;
        this.type = type;
        this.message = message;
        this.sentAt = sentAt;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
