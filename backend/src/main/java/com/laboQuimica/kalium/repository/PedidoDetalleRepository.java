package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.PedidoDetalle;
import com.laboQuimica.kalium.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoDetalleRepository extends JpaRepository<PedidoDetalle, Integer> {
    List<PedidoDetalle> findByPedido(Pedido pedido);
}
