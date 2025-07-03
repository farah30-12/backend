package com.backend.qu2data.service;

import com.backend.qu2data.entites.OnlineStatus;
import com.backend.qu2data.repository.OnlineStatusRepository;

import org.springframework.stereotype.Service;



import java.util.List;
import java.util.Optional;

@Service
public class OnlineStatusService {
    private final OnlineStatusRepository onlineStatusRepository;

    public OnlineStatusService(OnlineStatusRepository onlineStatusRepository) {
        this.onlineStatusRepository = onlineStatusRepository;
    }

    public List<OnlineStatus> getAllStatuses() {
        return onlineStatusRepository.findAll();
    }

    public Optional<OnlineStatus> getStatusById(Integer id) {
        return onlineStatusRepository.findById(id);
    }

    public OnlineStatus saveStatus(OnlineStatus status) {
        return onlineStatusRepository.save(status);
    }

    public void deleteStatus(Integer id) {
        onlineStatusRepository.deleteById(id);
    }
}
