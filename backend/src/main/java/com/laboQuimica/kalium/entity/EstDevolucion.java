package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "EstDevolucion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstDevolucion {
    
    @Id
    @Column(name = "IDEstDevolucion")
    private Integer idEstDevolucion;
    
    @Column(name = "EstadoDevolucion", nullable = false, length = 100)
    private String estadoDevolucion;
}
