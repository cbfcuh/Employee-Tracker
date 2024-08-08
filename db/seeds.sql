-- Insert departments
INSERT INTO departments (department) VALUES 
('Engineering'), 
('Customer Service'), 
('Sales'), 
('Legal'), 
('Finance');

-- Insert roles
INSERT INTO roles (title, salary, department_id) VALUES 
('Senior Engineer', 150000, 1), 
('Sales Manager', 90000, 3), 
('Customer Service Manager', 70000, 2), 
('Lawyer', 200000, 4), 
('Accountant', 75000, 5), 
('Junior Engineer', 100000, 1), 
('Floor Sales', 70000, 3), 
('Accountant Intern', 55000, 5);

-- Insert employees
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES 
('John', 'Doe', 1, NULL), 
('Phillip', 'Lam', 2, NULL), 
('Emily', 'Tucci', 3, NULL), 
('Bryan', 'Dinh', 4, NULL), 
('Kristine', 'White', 5, NULL), 
('RT', 'James', 6, 1), 
('Nick', 'Lee', 7, 3), 
('Ben', 'Smith', 2, 2), 
('Alicia', 'Ferg', 8, 5);
