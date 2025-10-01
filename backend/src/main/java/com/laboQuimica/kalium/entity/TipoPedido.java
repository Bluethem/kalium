package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TipoPedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoPedido {
    
    @Id
    @Column(name = "IDTipoPedido")
    private Integer idTipoPedido;
    
    @Column(name = "NombrePedido", nullable = false, length = 100)
    private String nombrePedido;
}
