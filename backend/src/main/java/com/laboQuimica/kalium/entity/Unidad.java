package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Unidad")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Unidad {
    
    @Id
    @Column(name = "IDUnidad")
    private Integer idUnidad;
    
    @Column(name = "Unidad", nullable = false, length = 50)
    private String unidad;
}
