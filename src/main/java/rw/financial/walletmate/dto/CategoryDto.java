package rw.financial.walletmate.dto;

import lombok.Data;
import java.util.List;

@Data
public class CategoryDto {
    private Long id;
    private Long userId;
    private String name;
    private String description;
    private List<SubcategoryDto> subcategories;
    private Long transactionCount;
    private Double totalSpent;
}
