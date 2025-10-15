package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Curso")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Curso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDCurso")
    private Integer idCurso;
    
    @Column(name = "NombreCurso", nullable = false, length = 100)
    private String nombreCurso;
    
    @Column(name = "Codigo", nullable = false, unique = true, length = 20)
    private String codigo;
    
    @Column(name = "Descripcion", length = 255)
    private String descripcion;
}
