'use client';

import React, { useState, useEffect } from 'react';
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
    CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '@/hooks/use-auth';
import { Category, categoryService } from '@/services/category';
import { SubcategoryDto, subcategoryService } from '@/services/subcategory';
import { toast } from 'react-hot-toast';

export default function CategoriesPage(): JSX.Element {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState<string>('');
    const [categoryDescription, setCategoryDescription] = useState<string>('');
    const [subcategories, setSubcategories] = useState<string[]>([]);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            if (!user?.id) return;
            
            try {
                const data = await categoryService.getCategories(Number(user.id));
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                toast.error('Failed to fetch categories');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [user?.id]);

    // Open dialog for adding/editing category
    const handleOpenDialog = (category: Category | null = null): void => {
        if (category) {
            setEditingCategory(category);
            setCategoryName(category.name ?? '');
            setCategoryDescription(category.description ?? '');
            setSubcategories(category.subcategories?.map(sub => sub.name) ?? []);
        } else {
            setEditingCategory(null);
            setCategoryName('');
            setCategoryDescription('');
            setSubcategories([]);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = (): void => {
        setOpenDialog(false);
        setEditingCategory(null);
        setCategoryName('');
        setCategoryDescription('');
        setSubcategories([]);
    };

    // Save a category
    const handleSaveCategory = async (): Promise<void> => {
        if (!user?.id || submitting) return;

        setSubmitting(true);
        try {
            if (editingCategory) {
                // Update existing category
                await categoryService.updateCategory(editingCategory.id, {
                    name: categoryName,
                    description: categoryDescription,
                    subcategories: []  // We'll handle subcategories separately
                });

                // Handle subcategories
                for (const subName of subcategories) {
                    await subcategoryService.createSubcategory(Number(editingCategory.id), {
                        name: subName,
                        categoryId: Number(editingCategory.id),
                        userId: Number(user?.id) ? Number(user.id) : 0
                    });
                }
            } else {
                // Create new category
                const newCategory = await categoryService.createCategory({
                    name: categoryName,
                    description: categoryDescription,
                    userId: Number(user?.id) ? Number(user.id) : 0,
                    subcategories: []  // We'll handle subcategories separately
                });

                // Create subcategories for the new category
                for (const subName of subcategories) {
                    await subcategoryService.createSubcategory(Number(newCategory.id), {
                        name: subName,
                        categoryId: Number(newCategory.id),
                        userId: Number(user?.id) ? Number(user.id) : 0
                    });
                }
            }
            
            // Refresh categories
            const updatedCategories = await categoryService.getCategories(Number(user.id));
            setCategories(updatedCategories);
            handleCloseDialog();
        } catch (error) {
            console.error('Failed to save category:', error);
            toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete a category
    const handleDeleteCategory = async (id: number): Promise<void> => {
        if (!user?.id) return;

        try {
            await categoryService.deleteCategory(id);
            const updatedCategories = await categoryService.getCategories(Number(user.id));
            setCategories(updatedCategories);
            toast.success('Category deleted successfully');
        } catch (error) {
            console.error('Failed to delete category:', error);
            toast.error('Failed to delete category');
        }
    };

    // Add a new subcategory
    const handleAddSubcategory = (): void => {
        setSubcategories(prev => [...prev, '']);
    };

    // Update a subcategory
    const handleUpdateSubcategory = (index: number, value: string): void => {
        setSubcategories(prev =>
            prev.map((sub, i) => (i === index ? value : sub))
        );
    };

    // Delete a subcategory
    const handleDeleteSubcategory = (index: number): void => {
        setSubcategories(prev => prev.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

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
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                {category.description}
                            </Typography>
                            <List>
                                {category.subcategories?.map((sub) => (
                                    <ListItem key={sub.id}>
                                        <ListItemText primary={sub.name} />
                                    </ListItem>
                                )) || null}
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

            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Add Category'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Category Name"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            margin="normal"
                            disabled={submitting}
                        />
                        <TextField
                            fullWidth
                            label="Category Description"
                            value={categoryDescription}
                            onChange={(e) => setCategoryDescription(e.target.value)}
                            margin="normal"
                            disabled={submitting}
                        />
                        
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Subcategories
                            </Typography>
                            {subcategories.map((subcategory, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={subcategory}
                                        onChange={(e) => handleUpdateSubcategory(index, e.target.value)}
                                        placeholder={`Subcategory ${index + 1}`}
                                        disabled={submitting}
                                    />
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteSubcategory(index)}
                                        disabled={submitting}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                startIcon={<Add />}
                                onClick={handleAddSubcategory}
                                disabled={submitting}
                            >
                                Add Subcategory
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveCategory}
                        disabled={submitting || !categoryName.trim()}
                    >
                        {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
