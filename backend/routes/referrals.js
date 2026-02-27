const express = require('express');

const router = express.Router();

// In-memory storage
let referrals = [];

// List all referrals
router.get('/', async (req, res) => {
  try {
    res.json(referrals);
  } catch (error) {
    console.error('List referrals error:', error);
    res.status(500).json({ error: error.message || 'Failed to list referrals' });
  }
});

module.exports = router;
