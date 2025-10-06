package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Quimico;
import com.laboQuimica.kalium.entity.TipoInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuimicoRepository extends JpaRepository<Quimico, Integer> {
    
    List<Quimico> findByTipoInsumo(TipoInsumo tipoInsumo);
    
    List<Quimico> findByTipoInsumoOrderByFechaIngresoAsc(TipoInsumo tipoInsumo);

    @Query("SELECT COALESCE(SUM(q.cantQuimico), 0.0) FROM Quimico q WHERE q.tipoInsumo.idTipoInsumo = :idTipoInsumo")
    Float sumCantidadByTipoInsumo(@Param("idTipoInsumo") Integer idTipoInsumo);
}