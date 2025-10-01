package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.EstPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstPedidoRepository extends JpaRepository<EstPedido, Integer> {
}
