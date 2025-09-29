package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Entrega;
import com.laboQuimica.kalium.entity.Pedido;
import com.laboQuimica.kalium.entity.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EntregaRepository extends JpaRepository<Entrega, Integer> {
    List<Entrega> findByPedido(Pedido pedido);
    List<Entrega> findByEstudiante(Estudiante estudiante);
}
