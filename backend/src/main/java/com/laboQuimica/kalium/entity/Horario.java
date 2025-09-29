package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Horario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Horario {
    
    @Id
    @Column(name = "IDHorario")
    private Integer idHorario;
    
    @Column(name = "FechaEntrega", nullable = false)
    private LocalDate fechaEntrega;
    
    @Column(name = "HoraInicio", nullable = false)
    private LocalDateTime horaInicio;
}
