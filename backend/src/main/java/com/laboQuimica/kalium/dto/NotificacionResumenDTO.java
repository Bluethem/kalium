package com.laboQuimica.kalium.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionResumenDTO {
    private Long totalNoLeidas;
    private Long totalBajoStock;
    private Long totalPedidosPendientes;
    private Long totalIncidentes;
}