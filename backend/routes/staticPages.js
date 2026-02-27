const express = require('express');

const router = express.Router();

// In-memory storage
let pages = [];
let pageCounter = 1;

// List all static pages
router.get('/', async (req, res) => {
  try {
    const formattedPages = pages.map(page => ({
      id: page.id,
      _id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      isPublished: page.isPublished,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    }));
    res.json(formattedPages);
  } catch (error) {
    console.error('List static pages error:', error);
    res.status(500).json({ error: error.message || 'Failed to list static pages' });
  }
});

// Get static page by ID
router.get('/:id', async (req, res) => {
  try {
    const page = pages.find(p => p.id === req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Static page not found' });
    }
    res.json({
      id: page.id,
      _id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      isPublished: page.isPublished,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    });
  } catch (error) {
    console.error('Get static page error:', error);
    res.status(500).json({ error: error.message || 'Failed to get static page' });
  }
});

// Create static page
router.post('/', async (req, res) => {
  try {
    const { title, slug, content, isPublished } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug are required' });
    }

    // Check if slug already exists
    const existingPage = pages.find(p => p.slug === slug);
    if (existingPage) {
      return res.status(400).json({ error: 'A page with this slug already exists' });
    }

    const page = {
      id: `page_${pageCounter++}`,
      title,
      slug,
      content: content || '',
      isPublished: isPublished || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    pages.push(page);
    res.status(201).json({
      id: page.id,
      _id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      isPublished: page.isPublished,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    });
  } catch (error) {
    console.error('Create static page error:', error);
    res.status(500).json({ error: error.message || 'Failed to create static page' });
  }
});

// Update static page
router.put('/:id', async (req, res) => {
  try {
    const { title, slug, content, isPublished } = req.body;

    // If slug is being updated, check if it conflicts with another page
    if (slug) {
      const existingPage = pages.find(p => p.slug === slug && p.id !== req.params.id);
      if (existingPage) {
        return res.status(400).json({ error: 'A page with this slug already exists' });
      }
    }

    const page = pages.find(p => p.id === req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Static page not found' });
    }

    if (title !== undefined) page.title = title;
    if (slug !== undefined) page.slug = slug;
    if (content !== undefined) page.content = content;
    if (isPublished !== undefined) page.isPublished = isPublished;
    page.updatedAt = new Date().toISOString();

    res.json({
      id: page.id,
      _id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      isPublished: page.isPublished,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    });
  } catch (error) {
    console.error('Update static page error:', error);
    res.status(500).json({ error: error.message || 'Failed to update static page' });
  }
});

// Delete static page
router.delete('/:id', async (req, res) => {
  try {
    const index = pages.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Static page not found' });
    }
    pages.splice(index, 1);
    res.json({ message: 'Static page deleted successfully' });
  } catch (error) {
    console.error('Delete static page error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete static page' });
  }
});

module.exports = router;
