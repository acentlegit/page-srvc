const express = require('express');
const StaticPage = require('../models/StaticPage');

const router = express.Router();

// List all static pages
router.get('/', async (req, res) => {
  try {
    const pages = await StaticPage.find().sort({ updatedAt: -1 });
    const formattedPages = pages.map(page => ({
      id: page._id,
      _id: page._id,
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
    const page = await StaticPage.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Static page not found' });
    }
    res.json({
      id: page._id,
      _id: page._id,
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
    const existingPage = await StaticPage.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({ error: 'A page with this slug already exists' });
    }

    const page = new StaticPage({
      title,
      slug,
      content: content || '',
      isPublished: isPublished || false,
    });

    const savedPage = await page.save();
    res.status(201).json({
      id: savedPage._id,
      _id: savedPage._id,
      title: savedPage.title,
      slug: savedPage.slug,
      content: savedPage.content,
      isPublished: savedPage.isPublished,
      createdAt: savedPage.createdAt,
      updatedAt: savedPage.updatedAt,
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
      const existingPage = await StaticPage.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingPage) {
        return res.status(400).json({ error: 'A page with this slug already exists' });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const page = await StaticPage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!page) {
      return res.status(404).json({ error: 'Static page not found' });
    }

    res.json({
      id: page._id,
      _id: page._id,
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
    const page = await StaticPage.findByIdAndDelete(req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Static page not found' });
    }
    res.json({ message: 'Static page deleted successfully' });
  } catch (error) {
    console.error('Delete static page error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete static page' });
  }
});

module.exports = router;
