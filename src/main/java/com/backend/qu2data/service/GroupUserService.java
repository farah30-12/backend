package com.backend.qu2data.service;



import com.backend.qu2data.entites.GroupUser;
import com.backend.qu2data.repository.GroupUserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupUserService {

    @Autowired
    private GroupUserRepository groupUserRepository;

    public List<GroupUser> getAllGroupUsers() {
        return groupUserRepository.findAll();
    }

    public GroupUser saveGroupUser(GroupUser groupUser) {
        return groupUserRepository.save(groupUser);
    }

    public void deleteGroupUser(Integer id) {
        groupUserRepository.deleteById(id);
    }
}

