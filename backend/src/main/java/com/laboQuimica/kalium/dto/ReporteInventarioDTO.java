package com.laboQuimica.kalium.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteInventarioDTO {
    
    private Integer idTipoInsumo;
    private String nombreProducto;
    private String categoria;
    private String cantidad;
    private String unidad;
    private String ultimaActualizacion;
    private Boolean esQuimico;
}