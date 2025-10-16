package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "EstInsumo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstInsumo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDEstInsumo")
    private Integer idEstInsumo;
    
    @Column(name = "NombreEstInsumo", nullable = false, length = 100)
    private String nombreEstInsumo;
}
