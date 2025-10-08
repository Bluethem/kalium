package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Instructor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Instructor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDInstructor")
    private Integer idInstructor;
    
    @ManyToOne
    @JoinColumn(name = "IDUsuario", nullable = false)
    private Usuario usuario;
}
