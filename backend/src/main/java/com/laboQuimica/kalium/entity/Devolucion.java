package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Devolucion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Devolucion {
    
    @Id
    @Column(name = "IDDevolucion")
    private Integer idDevolucion;
    
    @Column(name = "FechaDevolucion", nullable = false)
    private LocalDate fechaDevolucion;
    
    @Column(name = "HoraDevolucion", nullable = false)
    private LocalDateTime horaDevolucion;
    
    @ManyToOne
    @JoinColumn(name = "IDPedido", nullable = false)
    private Pedido pedido;
    
    @ManyToOne
    @JoinColumn(name = "IDEstDevolucion", nullable = false)
    private EstDevolucion estDevolucion;
    
    @ManyToOne
    @JoinColumn(name = "IDEntrega", nullable = false)
    private Entrega entrega;
}
