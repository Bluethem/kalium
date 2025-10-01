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
    @Column(name = "IDCurso")
    private Integer idCurso;
    
    @Column(name = "NombreCurso", nullable = false, length = 100)
    private String nombreCurso;
}
