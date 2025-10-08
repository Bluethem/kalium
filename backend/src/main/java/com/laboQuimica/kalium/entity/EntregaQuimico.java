package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "EntregaQuimico")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntregaQuimico {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDEntregaQuimico")
    private Integer idEntregaQuimico;
    
    @ManyToOne
    @JoinColumn(name = "IDEntrega", nullable = false)
    private Entrega entrega;
    
    @ManyToOne
    @JoinColumn(name = "IDQuimico", nullable = false)
    private Quimico quimico;
}
