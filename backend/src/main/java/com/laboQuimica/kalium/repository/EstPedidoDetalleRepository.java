package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.EstPedidoDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstPedidoDetalleRepository extends JpaRepository<EstPedidoDetalle, Integer> {
}
