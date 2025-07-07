package com.backend.qu2data.controller;



import com.backend.qu2data.entites.GroupUser;
import com.backend.qu2data.service.GroupUserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/group-users")
public class GroupUserController {

    @Autowired
    private GroupUserService groupUserService;

    @GetMapping
    public List<GroupUser> getAllGroupUsers() {
        return groupUserService.getAllGroupUsers();
    }

    @PostMapping
    public GroupUser saveGroupUser(@RequestBody GroupUser groupUser) {
        return groupUserService.saveGroupUser(groupUser);
    }

    @DeleteMapping("/{id}")
    public void deleteGroupUser(@PathVariable Integer id) {
        groupUserService.deleteGroupUser(id);
    }
}
