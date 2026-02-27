import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Code } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import { staticPagesApi } from '../../api/citizenServices';

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function StaticPagesPage() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    isPublished: false,
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await staticPagesApi.list();
      setPages(data);
    } catch (err: any) {
      // OFFLINE MODE: Don't show errors, just use empty array
      console.log('Static pages load error (offline mode):', err);
      setPages([]);
      setError(null); // Don't show error in offline mode
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (page?: StaticPage) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content,
        isPublished: page.isPublished,
      });
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        slug: '',
        content: '',
        isPublished: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      isPublished: false,
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title.trim()) {
        setError('Page title is required');
        return;
      }

      if (!formData.slug.trim()) {
        setError('Page slug is required');
        return;
      }

      if (editingPage) {
        await staticPagesApi.update(editingPage.id, formData);
      } else {
        await staticPagesApi.create(formData);
      }
      handleCloseDialog();
      loadPages();
    } catch (err: any) {
      setError(err.message || 'Failed to save page');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        await staticPagesApi.delete(id);
        loadPages();
      } catch (err: any) {
        setError(err.message || 'Failed to delete page');
      }
    }
  };

  const handlePreview = (page: StaticPage) => {
    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${page.title}</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>${page.title}</h1>
            <div>${page.content}</div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  return (
    <Box>
      <PageHeader
        title="Static Web Pages"
        subtitle="Create and manage static web pages for your application"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Create Page
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mt: 2 }}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading pages...</Typography>
            </Box>
          ) : pages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No static pages found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first static web page to get started.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Create First Page
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{page.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                          /{page.slug}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={page.isPublished ? 'Published' : 'Draft'}
                          size="small"
                          color={page.isPublished ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handlePreview(page)}
                          title="Preview"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(page)}
                          title="Edit"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(page.id)}
                          color="error"
                          title="Delete"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPage ? 'Edit Static Page' : 'Create Static Page'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Page Title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              fullWidth
              placeholder="e.g., About Us, Services, Contact"
            />
            <TextField
              label="URL Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              fullWidth
              placeholder="e.g., about-us, services, contact"
              helperText="This will be the URL path for your page (e.g., /about-us)"
            />
            <TextField
              label="Page Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={12}
              fullWidth
              placeholder="Enter HTML content or plain text for your page..."
              helperText="You can use HTML tags for formatting"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              />
              <label htmlFor="isPublished">
                <Typography variant="body2">Publish this page</Typography>
              </label>
            </Box>
            <Alert severity="info">
              <Typography variant="caption">
                <strong>Static Pages:</strong> These are regular web pages without interactive features.
                For dynamic pages with chat rooms, communications, etc., use the Page Preferences section in the intake form.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPage ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
