const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// In-memory storage
let employees = [];

// List all employees (with optional filter by customApplicationId)
router.get('/', async (req, res) => {
  try {
    const { customApplicationId } = req.query;
    let filteredEmployees = employees;
    
    if (customApplicationId) {
      filteredEmployees = employees.filter(
        (e) => e.customApplicationId === customApplicationId
      );
    }
    
    // Ensure all employees have projectIds field (for backward compatibility)
    const formattedEmployees = filteredEmployees.map(emp => ({
      ...emp,
      projectIds: emp.projectIds || emp.projects || [],
    }));
    
    res.json(formattedEmployees);
  } catch (error) {
    console.error('List employees error:', error);
    res.status(500).json({ error: error.message || 'Failed to list employees' });
  }
});

// Get a single employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = employees.find((e) => e.id === req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: error.message || 'Failed to get employee' });
  }
});

// Create a new employee
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, role, customApplicationId, projects, projectIds } = req.body;
    
    if (!name || !email || !customApplicationId) {
      return res.status(400).json({ 
        error: 'Employee name, email, and customApplicationId are required' 
      });
    }
    
    // Check if email already exists for this application
    const existingEmployee = employees.find(
      (e) => e.email === email && e.customApplicationId === customApplicationId
    );
    if (existingEmployee) {
      return res.status(400).json({ 
        error: 'An employee with this email already exists for this application' 
      });
    }
    
    const newEmployee = {
      id: uuidv4(),
      name,
      email,
      phone: phone || '',
      role: role || 'employee',
      customApplicationId,
      projectIds: projectIds || projects || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    employees.push(newEmployee);
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: error.message || 'Failed to create employee' });
  }
});

// Update an employee
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, role, projects, projectIds } = req.body;
    const employeeIndex = employees.findIndex((e) => e.id === req.params.id);
    
    if (employeeIndex === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check if email is being changed and conflicts with another employee
    if (email && email !== employees[employeeIndex].email) {
      const existingEmployee = employees.find(
        (e) => e.email === email && 
               e.customApplicationId === employees[employeeIndex].customApplicationId &&
               e.id !== req.params.id
      );
      if (existingEmployee) {
        return res.status(400).json({ 
          error: 'An employee with this email already exists for this application' 
        });
      }
    }
    
    // Use projectIds if provided, otherwise use projects, otherwise keep existing
    const finalProjectIds = projectIds !== undefined 
      ? projectIds 
      : projects !== undefined 
        ? projects 
        : employees[employeeIndex].projectIds || employees[employeeIndex].projects || [];
    
    const updatedEmployee = {
      ...employees[employeeIndex],
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(role !== undefined && { role }),
      projectIds: finalProjectIds,
      updatedAt: new Date().toISOString(),
    };
    
    employees[employeeIndex] = updatedEmployee;
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: error.message || 'Failed to update employee' });
  }
});

// Delete an employee
router.delete('/:id', async (req, res) => {
  try {
    const employeeIndex = employees.findIndex((e) => e.id === req.params.id);
    
    if (employeeIndex === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    employees.splice(employeeIndex, 1);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete employee' });
  }
});

module.exports = router;
