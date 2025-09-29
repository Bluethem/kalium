package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "EntregaInsumo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntregaInsumo {
    
    @Id
    @Column(name = "IDEntregaInsumo")
    private Integer idEntregaInsumo;
    
    @ManyToOne
    @JoinColumn(name = "IDEntrega", nullable = false)
    private Entrega entrega;
    
    @ManyToOne
    @JoinColumn(name = "IDInsumo", nullable = false)
    private Insumo insumo;
}
