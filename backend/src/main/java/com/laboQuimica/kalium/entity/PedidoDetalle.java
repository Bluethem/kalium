package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PedidoDetalle")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoDetalle {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDPedidoDetalle")
    private Integer idPedidoDetalle;
    
    @Column(name = "CantInsumo", nullable = false)
    private Integer cantInsumo;
    
    @ManyToOne
    @JoinColumn(name = "IDPedido", nullable = false)
    private Pedido pedido;
    
    @ManyToOne
    @JoinColumn(name = "IDTipoInsumo", nullable = false)
    private TipoInsumo tipoInsumo;
}
