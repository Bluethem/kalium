package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TipoInsumo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoInsumo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ← AGREGAR ESTA LÍNEA
    @Column(name = "IDTipoInsumo")
    private Integer idTipoInsumo;
    
    @Column(name = "NombreTipoInsumo", nullable = false, length = 100)
    private String nombreTipoInsumo;
    
    @Column(name = "Descripcion", nullable = false, length = 255)
    private String descripcion;
    
    @ManyToOne
    @JoinColumn(name = "IDCategoria", nullable = false)
    private Categoria categoria;
    
    @ManyToOne
    @JoinColumn(name = "IDUnidad", nullable = false)
    private Unidad unidad;

    @Column(name = "EsQuimico", nullable = false, length = 1)
    private Boolean esQuimico;
}