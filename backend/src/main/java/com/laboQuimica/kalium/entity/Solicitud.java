package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Solicitud")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDSolicitud")
    private Integer idSolicitud;

    @Column(name = "Nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "Apellido", nullable = false, length = 100)
    private String apellido;

    @Column(name = "Correo", nullable = false, length = 100)
    private String correo;

    @Column(name = "Contrasena", nullable = false, length = 100)
    private String contrasena;

    @Column(name = "IDRol", nullable = false)
    private Integer idRol; // 2=admin, 3=instructor, 4=alumno
}
