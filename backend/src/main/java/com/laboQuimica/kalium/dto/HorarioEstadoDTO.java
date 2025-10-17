package com.laboQuimica.kalium.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class HorarioEstadoDTO {
    private Integer idHorario;
    private LocalDate fechaEntrega;
    private LocalDateTime horaInicio;
    private boolean ocupado;
    private String estado;

    public HorarioEstadoDTO(Integer idHorario, LocalDate fechaEntrega, LocalDateTime horaInicio, boolean ocupado) {
        this.idHorario = idHorario;
        this.fechaEntrega = fechaEntrega;
        this.horaInicio = horaInicio;
        this.ocupado = ocupado;
        this.estado = ocupado ? "Ocupado" : "Disponible";
    }
}
