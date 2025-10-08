package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Experimento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Experimento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDExperimento")
    private Integer idExperimento;
    
    @Column(name = "NombreExperimento", nullable = false, length = 100)
    private String nombreExperimento;
}
