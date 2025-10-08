package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DetalleExperimento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleExperimento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDDetalleExperimento")
    private Integer idDetalleExperimento;
    
    @Column(name = "CantInsumoExperimento", nullable = false)
    private Integer cantInsumoExperimento;
    
    @ManyToOne
    @JoinColumn(name = "IDTipoInsumo", nullable = false)
    private TipoInsumo tipoInsumo;
    
    @ManyToOne
    @JoinColumn(name = "IDExperimento", nullable = false)
    private Experimento experimento;
}
