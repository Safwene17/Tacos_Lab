package com.example.backend.repository;

import com.example.backend.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {

    List<MenuItem> findAllByActiveTrueOrderByDisplayOrderAsc();

    Page<MenuItem> findAll(Pageable pageable);
}