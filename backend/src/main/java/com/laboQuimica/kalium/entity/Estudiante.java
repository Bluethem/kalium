package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Estudiante")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Estudiante {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDEstudiante")
    private Integer idEstudiante;
    
    @Column(name = "Nombre", nullable = false, length = 100)
    private String nombre;
    
    @Column(name = "Apellido", nullable = false, length = 100)
    private String apellido;
}
