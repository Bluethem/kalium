package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Categoria")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Categoria {
    
    @Id
    @Column(name = "IDCategoria")
    private Integer idCategoria;
    
    @Column(name = "NombreCategoria", nullable = false, length = 50)
    private String nombreCategoria;
}
