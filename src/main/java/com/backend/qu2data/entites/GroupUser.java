package com.backend.qu2data.entites;

import jakarta.persistence.*;

@Entity
@Table(name = "group_users")
public class GroupUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "is_admin", nullable = false)
    private Boolean isAdmin;

    @Column(name = "nick_name")
    private String nickName;
    @ManyToOne(fetch = FetchType.EAGER) // 👈 EAGER ici pour charger le user automatiquement
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private Users user; // ✅ PAS DE CHAMP "users" en doublon

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Boolean getIsAdmin() {
        return isAdmin;
    }

    public void setIsAdmin(Boolean isAdmin) {
        this.isAdmin = isAdmin;
    }

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }
}
