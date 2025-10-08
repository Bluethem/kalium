package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "EstPedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstPedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDEstPedido")
    private Integer idEstPedido;
    
    @Column(name = "NombreEstPedido", nullable = false, length = 100)
    private String nombreEstPedido;
}
