package rw.financial.walletmate.dto;

import lombok.Data;

@Data
public class SubcategoryDto {
    private Long id;
    private Long categoryId;
    private Long userId; // Add this field to store the user ID
    private String name;
    private String description;
    private Long transactionCount;
    private Double totalSpent;
}
