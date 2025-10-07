package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Rol")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rol {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDRol")
    private Integer idRol;
    
    @Column(name = "NombreRol", nullable = false, unique = true, length = 50)
    private String nombreRol;
    
    @Column(name = "Descripcion", length = 255)
    private String descripcion;
}