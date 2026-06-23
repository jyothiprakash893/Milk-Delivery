package com.milkdelivery.notification.repository;

import com.milkdelivery.notification.entity.NotificationLog;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemoryNotificationLogRepository implements NotificationLogRepository {

    private final Map<Long, NotificationLog> store = new ConcurrentHashMap<>();

    @Override
    public NotificationLog save(NotificationLog log) {
        store.put(log.getId(), log);
        return log;
    }

    @Override
    public Optional<NotificationLog> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<NotificationLog> findByCustomerId(Long customerId) {
        return store.values().stream()
                .filter(log -> log.getCustomerId().equals(customerId))
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationLog> findAll() {
        return new ArrayList<>(store.values());
    }
}
