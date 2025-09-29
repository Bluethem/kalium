package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.EstInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstInsumoRepository extends JpaRepository<EstInsumo, Integer> {
}
