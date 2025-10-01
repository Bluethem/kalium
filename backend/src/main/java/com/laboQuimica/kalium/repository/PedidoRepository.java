package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Pedido;
import com.laboQuimica.kalium.entity.Instructor;
import com.laboQuimica.kalium.entity.EstPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    List<Pedido> findByInstructor(Instructor instructor);
    List<Pedido> findByEstPedido(EstPedido estPedido);
}
