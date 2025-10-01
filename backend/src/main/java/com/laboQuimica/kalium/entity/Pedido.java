package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "Pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {
    
    @Id
    @Column(name = "IDPedido")
    private Integer idPedido;
    
    @Column(name = "FechaPedido", nullable = false)
    private LocalDate fechaPedido;
    
    @Column(name = "CantGrupos", nullable = false)
    private Integer cantGrupos;
    
    @ManyToOne
    @JoinColumn(name = "IDInstructor", nullable = false)
    private Instructor instructor;
    
    @ManyToOne
    @JoinColumn(name = "IDEstPedido", nullable = false)
    private EstPedido estPedido;
    
    @ManyToOne
    @JoinColumn(name = "IDCurso", nullable = false)
    private Curso curso;
    
    @ManyToOne
    @JoinColumn(name = "IDTipoPedido", nullable = false)
    private TipoPedido tipoPedido;
    
    @ManyToOne
    @JoinColumn(name = "IDHorario", nullable = false)
    private Horario horario;
}
