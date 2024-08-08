const inquirer = require("inquirer");
const { Pool } = require("pg");

// Connect to the database
const pool = new Pool({
  user: "postgres",
  password: "Birdsduy01",
  host: "localhost",
  database: "employees_db",
});

pool.connect();

// Inquirer prompts
const mainMenu = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "prompts",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "Add Employee",
          "Update Employee Role",
          "View All Roles",
          "Add Role",
          "View All Departments",
          "View Total Salary Spend",
          "Add Department",
          "Quit",
        ],
      },
    ])
    .then((answers) => {
      switch (answers.prompts) {
        case "View All Employees":
          viewEmployees();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateEmployee();
          break;
        case "View All Roles":
          viewRoles();
          break;
        case "Add Role":
          addRole();
          break;
        case "View All Departments":
          viewAllDepartments();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Quit":
          pool.end();
          break;
      }
    });
};

// view all departments 
const viewAllDepartments = () => {
  pool.query("SELECT * FROM departments;", function (err, result) {
    if (err) {
      console.error(err);
    } else {
      console.table(result.rows);
    }
    mainMenu();
  });
};

// view all roles 
const viewRoles = () => {
  pool.query(`SELECT roles.id AS role_id, roles.title, roles.salary, 
              departments.id AS department_id, departments.department AS department_name 
              FROM roles 
              JOIN departments ON roles.department_id = departments.id;`, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      console.table(result.rows);
    }
    mainMenu();
  });
};

// view all employees 
const viewEmployees = () => {
  pool.query(`SELECT employees.id AS employee_id, employees.first_name, employees.last_name, 
              roles.id AS role_id, roles.title AS role_title, roles.salary AS role_salary, 
              employees.manager_id AS manager_id, 
              departments.department AS department 
              FROM employees 
              INNER JOIN roles ON employees.role_id = roles.id 
              INNER JOIN departments ON roles.department_id = departments.id;`, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      console.table(result.rows);
    }
    mainMenu();
  });
};

// add a department 
const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "departmentTitle",
        message: "Add Department Title",
      },
    ])
    .then((answers) => {
      const { departmentTitle } = answers;
      pool.query("INSERT INTO departments (department) VALUES ($1)", [departmentTitle], (err, result) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Department added successfully!");
          mainMenu();
        }
      });
    })
    .catch((err) => {
      console.error("Error with prompt.", err);
    });
};

// add a role 
const addRole = () => {
  pool.query("SELECT id, department FROM departments;", (err, departmentResult) => {
    if (err) {
      console.error("Error fetching departments.", err);
      return;
    }
    const departments = departmentResult.rows.map((department) => ({
      name: department.department,
      value: department.id,
    }));
    inquirer
      .prompt([
        {
          type: "input",
          name: "roleTitle",
          message: "Add Role Title",
        },
        {
          type: "input",
          name: "salary",
          message: "Add Salary",
        },
        {
          type: "list",
          name: "department",
          message: "Select Department",
          choices: departments,
        },
      ])
      .then((answers) => {
        const { roleTitle, salary, department } = answers;
        pool.query(
          "INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)",
          [roleTitle, salary, department],
          (err, result) => {
            if (err) {
              console.error("Error inserting role.", err);
            } else {
              console.log("Role added successfully!");
            }
            mainMenu();
          }
        );
      })
      .catch((err) => {
        console.error("Error with prompt.", err);
      });
  });
};

// add an employee 
const addEmployee = () => {
  pool.query("SELECT id, title, salary FROM roles;", (err, rolesResult) => {
    if (err) {
      console.error("Error fetching roles.", err);
      return;
    }
    const roles = rolesResult.rows.map((role) => ({
      name: `${role.title} (Salary: ${role.salary})`,
      value: role.id,
    }));
    pool.query("SELECT id, first_name, last_name FROM employees;", (err, employeesResult) => {
      if (err) {
        console.error("Error fetching employees.", err);
        return;
      }
      const managers = employeesResult.rows.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      }));
      managers.unshift({ name: "None", value: null });

      inquirer
        .prompt([
          {
            type: "input",
            name: "firstName",
            message: "Add First Name",
          },
          {
            type: "input",
            name: "lastName",
            message: "Add Last Name",
          },
          {
            type: "list",
            name: "roleId",
            message: "Select Role",
            choices: roles,
          },
          {
            type: "list",
            name: "managerId",
            message: "Select Manager",
            choices: managers,
          },
        ])
        .then((answers) => {
          const { firstName, lastName, roleId, managerId } = answers;
          pool.query(
            "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
            [firstName, lastName, roleId, managerId],
            (err, result) => {
              if (err) {
                console.error(err);
              } else {
                console.log("Employee added successfully!");
                mainMenu();
              }
            }
          );
        })
        .catch((err) => {
          console.error("Error with prompt.", err);
        });
    });
  });
};

// update an employee role
const updateEmployee = () => {
  pool.query("SELECT id, first_name, last_name FROM employees;", (err, employeeResult) => {
      if (err) {
        console.error("Error fetching employees.", err);
        return;
      }
      const employees = employeeResult.rows.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      }));
      inquirer
        .prompt([
          {
            type: "list",
            name: "employeeId",
            message: "Select Employee",
            choices: employees,
          },
        ])
        .then((answers) => {
          const { employeeId } = answers;
          pool.query("SELECT id, title FROM roles;", (err, roleResult) => {
            if (err) {
              console.error("Error fetching roles.", err);
              return;
            }
            const roles = roleResult.rows.map((role) => ({
              name: role.title,
              value: role.id,
            }));
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "roleId",
                  message: "Select New Role",
                  choices: roles,
                },
              ])
              .then((answers) => {
                const { roleId } = answers;
                pool.query("UPDATE employees SET role_id = $1 WHERE id = $2", [roleId, employeeId], (err, result) => {
                  if (err) {
                    console.error("Error updating employee role.", err);
                    return;
                  }
                  console.log("Employee role updated successfully!");
                  mainMenu();
                });
              })
              .catch((error) => {
                console.error("Error during role selection prompt.", error);
              });
          });
        })
        .catch((error) => {
          console.error("Error during employee selection prompt.", error);
        });
    }
  );
};

// Start the application
mainMenu();
