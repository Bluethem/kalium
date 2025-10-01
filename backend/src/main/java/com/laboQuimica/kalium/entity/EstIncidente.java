package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "EstIncidente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstIncidente {
    
    @Id
    @Column(name = "IDEstIncidente")
    private Integer idEstIncidente;
    
    @Column(name = "EstadoIncidente", nullable = false, length = 100)
    private String estadoIncidente;
}
