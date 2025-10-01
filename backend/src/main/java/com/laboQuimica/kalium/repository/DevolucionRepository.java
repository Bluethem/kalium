package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Devolucion;
import com.laboQuimica.kalium.entity.Pedido;
import com.laboQuimica.kalium.entity.EstDevolucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DevolucionRepository extends JpaRepository<Devolucion, Integer> {
    List<Devolucion> findByPedido(Pedido pedido);
    List<Devolucion> findByEstDevolucion(EstDevolucion estDevolucion);
}
