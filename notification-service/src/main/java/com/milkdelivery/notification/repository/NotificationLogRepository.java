package com.milkdelivery.notification.repository;

import com.milkdelivery.notification.entity.NotificationLog;

import java.util.List;
import java.util.Optional;

public interface NotificationLogRepository {

    NotificationLog save(NotificationLog log);

    Optional<NotificationLog> findById(Long id);

    List<NotificationLog> findByCustomerId(Long customerId);

    List<NotificationLog> findAll();
}
