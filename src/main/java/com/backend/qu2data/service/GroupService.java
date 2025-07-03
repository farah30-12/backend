package com.backend.qu2data.service;



import com.backend.qu2data.entites.Group;
import com.backend.qu2data.entites.GroupUser;
import com.backend.qu2data.entites.Users;
import com.backend.qu2data.repository.GroupRepository;
import com.backend.qu2data.repository.GroupUserRepository;
import com.backend.qu2data.repository.MessageRepository;
import com.backend.qu2data.repository.UsersRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GroupService {
	@Autowired
	private GroupUserRepository groupUserRepository;
	@Autowired
	private UsersRepository usersRepository;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    public GroupService(GroupRepository groupRepository,
                        GroupUserRepository groupUserRepository,
                        UsersRepository usersRepository,
                        MessageRepository messageRepository){
        this.groupRepository = groupRepository;
        this.groupUserRepository = groupUserRepository;
        this.usersRepository = usersRepository;
        this.messageRepository= messageRepository  ;
    }
 // Dans GroupService.java
    @Transactional
    public List<Map<String, Object>> getGroupMembers(Integer groupId) {
        List<GroupUser> groupUsers = groupUserRepository.findByGroupId(groupId);

        List<Map<String, Object>> members = new ArrayList<>();

        for (GroupUser gu : groupUsers) {
            Users user = gu.getUser(); // peut être null si la relation est cassée

            Map<String, Object> map = new HashMap<>();

            if (user != null) {
                map.put("userId", user.getId()); // ✅ Ajoute l'ID PostgreSQL
                map.put("firstName", user.getFirstName());
                map.put("lastName", user.getLastName());
            } else {
                map.put("userId", null); // pour garder la clé même si user est null
                map.put("firstName", "Inconnu");
                map.put("lastName", "");
            }

            map.put("nickName", gu.getNickName());
            map.put("isAdmin", gu.getIsAdmin());

            members.add(map);
        }

        return members;
    }
    public Group getGroupById(Integer groupId) {
        return groupRepository.findById(groupId).orElse(null);
    }

    public void addUsersToGroup(Integer groupId, List<Integer> userIds) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Groupe introuvable"));

        for (Integer userId : userIds) {
            Users user = usersRepository.findById(userId.longValue())

                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + userId));

            boolean alreadyExists = groupUserRepository.existsByGroupIdAndUserId(groupId, userId);
            if (!alreadyExists) {
                GroupUser groupUser = new GroupUser();
                groupUser.setGroup(group);
                groupUser.setUser(user);
                groupUser.setIsAdmin(false); // tu peux modifier cette valeur si besoin
                groupUser.setNickName(user.getFirstName() + " " + user.getLastName());
                groupUserRepository.save(groupUser);
            }
        }
    }
    
    public void removeUserFromGroup(Integer groupId, Integer userId) {
        GroupUser groupUser = groupUserRepository.findByGroupIdAndUserId(groupId, userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé dans le groupe"));

        groupUserRepository.delete(groupUser);
    }
    public List<Group> getGroupsForUser(Integer userId) {
        List<GroupUser> memberships = groupUserRepository.findByUserId(userId);
        return memberships.stream()
                .map(GroupUser::getGroup)
                .distinct()
                .toList();
    }
    public List<Group> findGroupsWithMessagesForUser(Integer userId) {
        List<GroupUser> memberships = groupUserRepository.findByUserId(userId);
        Set<Group> allGroups = memberships.stream().map(GroupUser::getGroup).collect(Collectors.toSet());

        List<Group> withMessages = groupRepository.findAll().stream()
            .filter(g -> !messageRepository.findByGroup_IdOrderByTimestampAsc(g.getId()).isEmpty())
            .collect(Collectors.toList());

        allGroups.addAll(withMessages); // union
        return new ArrayList<>(allGroups);
    }

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    public Group saveGroup(Group group) {
        return groupRepository.save(group);
    }

    public void deleteGroup(Integer id) {
        groupRepository.deleteById(id);
    }
}
