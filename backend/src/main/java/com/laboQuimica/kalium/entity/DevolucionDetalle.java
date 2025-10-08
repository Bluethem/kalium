package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DevolucionDetalle")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DevolucionDetalle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDDevolucionDetalle")
    private Integer idDevolucionDetalle;
    
    @ManyToOne
    @JoinColumn(name = "IDDevolucion", nullable = false)
    private Devolucion devolucion;
    
    @ManyToOne
    @JoinColumn(name = "IDInsumo", nullable = false)
    private Insumo insumo;
}
