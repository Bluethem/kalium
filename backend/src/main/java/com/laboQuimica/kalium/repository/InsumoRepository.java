package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Insumo;
import com.laboQuimica.kalium.entity.EstInsumo;
import com.laboQuimica.kalium.entity.TipoInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Integer> {
    List<Insumo> findByEstInsumo(EstInsumo estInsumo);
    List<Insumo> findByTipoInsumo(TipoInsumo tipoInsumo);
    
    @Query("SELECT COUNT(i) FROM Insumo i WHERE i.tipoInsumo.idTipoInsumo = :idTipoInsumo")
    Long countByTipoInsumo(@Param("idTipoInsumo") Integer idTipoInsumo);
    
    /**
     * Cuenta solo los insumos DISPONIBLES de un tipo específico
     * Estado "Disponible" = idEstInsumo = 1
     */
    @Query("SELECT COUNT(i) FROM Insumo i WHERE i.tipoInsumo.idTipoInsumo = :idTipoInsumo AND i.estInsumo.idEstInsumo = 1")
    Long countDisponiblesByTipoInsumo(@Param("idTipoInsumo") Integer idTipoInsumo);
    
    /**
     * Busca insumos disponibles de un tipo específico
     * Útil para reservar insumos al aprobar pedidos
     */
    List<Insumo> findByTipoInsumoAndEstInsumo(TipoInsumo tipoInsumo, EstInsumo estInsumo);
    
    /**
     * Busca insumos reservados de un tipo específico
     * Estado "Reservado" = idEstInsumo = 5
     */
    @Query("SELECT i FROM Insumo i WHERE i.tipoInsumo.idTipoInsumo = :idTipoInsumo AND i.estInsumo.idEstInsumo = 5")
    List<Insumo> findReservadosByTipoInsumo(@Param("idTipoInsumo") Integer idTipoInsumo);
}