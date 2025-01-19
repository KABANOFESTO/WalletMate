'use client';

import React, { useState } from 'react';
import {
    Stack,
    Box,
    Typography,
    Button,
    Card,
    Grid,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

// Define types for categories and subcategories
type Category = {
    id: number;
    name: string;
    subcategories: string[];
};

export default function CategoriesPage() {
    // Initial categories
    const initialCategories: Category[] = [
        { id: 1, name: 'Food', subcategories: ['Groceries', 'Dining Out'] },
        { id: 2, name: 'Transport', subcategories: ['Fuel', 'Public Transport'] },
        { id: 3, name: 'Utilities', subcategories: ['Electricity', 'Water', 'Internet'] },
    ];

    // State for categories, editing category, etc.
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState<string>('');
    const [subcategories, setSubcategories] = useState<string[]>([]);

    // Open dialog for adding/editing category
    const handleOpenDialog = (category: Category | null = null) => {
        if (category) {
            setEditingCategory(category);
            setCategoryName(category.name);
            setSubcategories(category.subcategories);
        } else {
            setEditingCategory(null);
            setCategoryName('');
            setSubcategories([]);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // Save a category
    const handleSaveCategory = () => {
        if (editingCategory) {
            // Edit existing category
            setCategories((prev) =>
                prev.map((cat) =>
                    cat.id === editingCategory.id
                        ? { ...cat, name: categoryName, subcategories }
                        : cat
                )
            );
        } else {
            // Add new category
            const newCategory: Category = {
                id: categories.length + 1,
                name: categoryName,
                subcategories,
            };
            setCategories((prev) => [...prev, newCategory]);
        }
        handleCloseDialog();
    };

    // Delete a category
    const handleDeleteCategory = (id: number) => {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
    };

    // Add a new subcategory
    const handleAddSubcategory = () => {
        setSubcategories((prev) => [...prev, '']);
    };

    // Update a subcategory
    const handleUpdateSubcategory = (index: number, value: string) => {
        setSubcategories((prev) =>
            prev.map((sub, i) => (i === index ? value : sub))
        );
    };

    // Delete a subcategory
    const handleDeleteSubcategory = (index: number) => {
        setSubcategories((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Stack spacing={4} sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Categories
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    Add Category
                </Button>
            </Box>

            <Grid container spacing={3}>
                {categories.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category.id}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {category.name}
                            </Typography>
                            <List>
                                {category.subcategories.map((sub, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={sub} />
                                    </ListItem>
                                ))}
                            </List>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <IconButton
                                    color="primary"
                                    onClick={() => handleOpenDialog(category)}
                                >
                                    <Edit />
                                </IconButton>
                                <IconButton
                                    color="error"
                                    onClick={() => handleDeleteCategory(category.id)}
                                >
                                    <Delete />
                                </IconButton>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Dialog for Add/Edit Category */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
                <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Add Category'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Category Name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Subcategories
                    </Typography>
                    {subcategories.map((sub, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TextField
                                fullWidth
                                value={sub}
                                onChange={(e) => handleUpdateSubcategory(index, e.target.value)}
                                sx={{ mr: 2 }}
                            />
                            <IconButton
                                color="error"
                                onClick={() => handleDeleteSubcategory(index)}
                            >
                                <Delete />
                            </IconButton>
                        </Box>
                    ))}
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleAddSubcategory}
                        sx={{ textTransform: 'none' }}
                    >
                        Add Subcategory
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveCategory}
                        sx={{ textTransform: 'none' }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
