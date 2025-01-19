package rw.financial.walletmate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.financial.walletmate.model.Subcategory;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {
    List<Subcategory> findByUserIdAndCategoryId(Long userId, Long categoryId);

    Optional<Subcategory> findByUserIdAndCategoryIdAndName(Long userId, Long categoryId, String name);

    
    List<Subcategory> findByCategoryId(Long categoryId);
}
