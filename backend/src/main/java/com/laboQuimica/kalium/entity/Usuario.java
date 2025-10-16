package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDUsuario")
    private Integer idUsuario;
    
    @Column(name = "Nombre", nullable = false, length = 100)
    private String nombre;
    
    @Column(name = "Apellido", nullable = false, length = 100)
    private String apellido;
    
    @Column(name = "Correo", nullable = false, unique = true, length = 100)
    private String correo;
    
    @Column(name = "Contrasena", nullable = false, length = 100)
    private String contrasena;
    
    // ✅ NUEVO CAMPO
    @ManyToOne
    @JoinColumn(name = "IDRol", nullable = false)
    private Rol rol;
}