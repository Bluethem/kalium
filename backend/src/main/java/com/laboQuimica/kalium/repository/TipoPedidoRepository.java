package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.TipoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoPedidoRepository extends JpaRepository<TipoPedido, Integer> {
}
