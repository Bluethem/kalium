package com.laboQuimica.kalium.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionDTO {
    private Integer idNotificacion;
    private String titulo;
    private String mensaje;
    private String tipo;
    private Boolean leida;
    private LocalDateTime fechaCreacion;
    private Integer idUsuario;
    private Integer idTipoInsumo;
    private String nombreTipoInsumo;
    private String datosExtra; // ✅ AGREGAR ESTE CAMPO
}