package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * ✅ MODIFICADO: Estudiante ahora referencia a Usuario
 * Sigue el mismo patrón que Administrador e Instructor
 */
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
    
    @OneToOne
    @JoinColumn(name = "IDUsuario", nullable = false, unique = true)
    private Usuario usuario;
}
