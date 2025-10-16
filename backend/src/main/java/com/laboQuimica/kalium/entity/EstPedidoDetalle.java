package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "EstPedidoDetalle")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstPedidoDetalle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDEstPedidoDetalle")
    private Integer idEstPedidoDetalle;
    
    @Column(name = "NombreEstDetalle", nullable = false, length = 50)
    private String nombreEstDetalle;
}
