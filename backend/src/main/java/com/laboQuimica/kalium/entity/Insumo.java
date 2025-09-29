package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Insumo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Insumo {
    
    @Id
    @Column(name = "IDInsumo")
    private Integer idInsumo;
    
    @ManyToOne
    @JoinColumn(name = "IDEstInsumo", nullable = false)
    private EstInsumo estInsumo;
    
    @ManyToOne
    @JoinColumn(name = "IDTipoInsumo", nullable = false)
    private TipoInsumo tipoInsumo;
}
