package com.laboQuimica.kalium.entity;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Quimico")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quimico {
    
    @Id
    @Column(name = "IDQuimico")
    private Integer idQuimico;
    
    @Column(name = "CantQuimico", nullable = false)
    private Float cantQuimico;
    
    @ManyToOne
    @JoinColumn(name = "IDTipoInsumo", nullable = false)
    private TipoInsumo tipoInsumo;

    @Column(name = "FechaIngreso", nullable = false)
    private LocalDate fechaIngreso;
}
