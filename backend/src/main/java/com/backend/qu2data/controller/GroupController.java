package com.backend.qu2data.controller;



import com.backend.qu2data.entites.Group;
import com.backend.qu2data.entites.GroupUser;
import com.backend.qu2data.entites.Users;
import com.backend.qu2data.repository.GroupRepository;
import com.backend.qu2data.repository.GroupUserRepository;
import com.backend.qu2data.repository.MessageRepository;
import com.backend.qu2data.repository.UsersRepository;
import com.backend.qu2data.service.GroupService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;
  
    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UsersRepository userRepository;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private GroupUserRepository groupUserRepository;
    @GetMapping
    public List<Group> getAllGroups() {
        return groupService.getAllGroups();
    }
 /*  @GetMapping("/groups/{groupId}/members")
    public ResponseEntity<List<Map<String, Object>>> getGroupMembers(@PathVariable Integer groupId) {
        List<GroupUser> groupUsers = groupUserRepository.findByGroupId(groupId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (GroupUser gu : groupUsers) {
            Users user = gu.getUser();
            Map<String, Object> map = new HashMap<>();
            map.put("userId", user.getId());
            map.put("keycloakId", user.getId_keycloak());
            map.put("nickName", gu.getNickName());
            map.put("isAdmin", gu.getIsAdmin());
            map.put("firstName", user.getFirstName());
            map.put("lastName", user.getLastName());
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }
*/
    @GetMapping("/groups-with-messages/{userId}")
    public ResponseEntity<?> getGroupsWithMessages(@PathVariable Integer userId) {
        try {
            List<Group> groups = groupService.findGroupsWithMessagesForUser(userId);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of()); // retourne un tableau vide []
        }
    }
    @PostMapping
    public Group saveGroup(@RequestBody Group group) {
        return groupService.saveGroup(group);
    }
    @PostMapping("/create")
    public ResponseEntity<Group> createGroupWithUsers(@RequestBody GroupCreationDto dto) {
        Group group = new Group();
        group.setName(dto.getName());
        group.setDescription(dto.getDescription());
        group.setIsClosed(dto.getIsClosed());
        Group savedGroup = groupRepository.save(group);

        for (int i = 0; i < dto.getMembers().size(); i++) {
            GroupUserDto member = dto.getMembers().get(i);
            Users user = userRepository.findById(Long.valueOf(member.getUserId())).orElseThrow();
            GroupUser groupUser = new GroupUser();
            groupUser.setGroup(savedGroup);
            groupUser.setUser(user);

            // 👇 Faire du premier utilisateur (créateur) l'admin
            if (i == 0) {
                groupUser.setIsAdmin(true);
            } else {
                groupUser.setIsAdmin(member.getIsAdmin());
            }

            groupUser.setNickName(member.getNickName());
            groupUserRepository.save(groupUser);
        }

        return ResponseEntity.ok(savedGroup);
    }
    @GetMapping("/all-user-groups/{userId}")
    public ResponseEntity<List<Group>> getAllUserGroups(@PathVariable Integer userId) {
        try {
            List<Group> groups = groupService.getGroupsForUser(userId);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
 
    @GetMapping("/{groupId}/members")
    public ResponseEntity<?> getMembers(@PathVariable Integer groupId) {
        try {
            List<Map<String, Object>> members = groupService.getGroupMembers(groupId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    @DeleteMapping("/{groupId}/remove-member/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Integer groupId, @PathVariable Integer userId) {
        groupService.removeUserFromGroup(groupId, userId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{groupId}/add-members")
    public ResponseEntity<?> addMembers(@PathVariable Integer groupId, @RequestBody List<Integer> userIds) {
        groupService.addUsersToGroup(groupId, userIds);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{id}")
    public void deleteGroup(@PathVariable Integer id) {
        groupService.deleteGroup(id);
    }
}
