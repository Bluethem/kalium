package com.laboQuimica.kalium.dto;

import com.laboQuimica.kalium.entity.Categoria;
import com.laboQuimica.kalium.entity.Unidad;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoInsumoStockDTO {
    
    private Integer idTipoInsumo;
    private String nombreTipoInsumo;
    private String descripcion;
    private Categoria categoria;
    private Unidad unidad;
    private Boolean esQuimico;
    
    // Para químicos: cantidad total en peso/volumen
    // Para insumos: cantidad de unidades
    private String cantidadTotal;
    
    // Cantidad numérica para ordenamiento
    private Double cantidadNumerica;
}