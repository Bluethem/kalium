package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Quimico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuimicoRepository extends JpaRepository<Quimico, Integer> {
}
