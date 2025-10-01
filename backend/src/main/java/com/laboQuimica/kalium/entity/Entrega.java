package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Entrega")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Entrega {
    
    @Id
    @Column(name = "IDEntrega")
    private Integer idEntrega;
    
    @Column(name = "FechaEntrega", nullable = false)
    private LocalDate fechaEntrega;
    
    @Column(name = "HoraEntrega", nullable = false)
    private LocalDateTime horaEntrega;
    
    @ManyToOne
    @JoinColumn(name = "IDPedido", nullable = false)
    private Pedido pedido;
    
    @ManyToOne
    @JoinColumn(name = "IDEstudiante", nullable = false)
    private Estudiante estudiante;
}
