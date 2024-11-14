// Data Persistence using localStorage
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let departments = JSON.parse(localStorage.getItem('departments')) || ['IT', 'Marketing', 'HR', 'Finance'];
let roles = JSON.parse(localStorage.getItem('roles')) || ['Software Engineer', 'Marketing Manager', 'HR Specialist', 'Accountant'];
let payrollRecords = JSON.parse(localStorage.getItem('payrollRecords')) || [];
let benefitPlans = JSON.parse(localStorage.getItem('benefitPlans')) || [];
let timesheets = JSON.parse(localStorage.getItem('timesheets')) || [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  loadDashboardMetrics();
  loadEmployeeManagement();
  loadPayrollModule();
  loadBenefitsModule();
  loadTimeAttendanceModule();
  loadReportsModule();
  loadSettingsModule();
});

// Navigation Setup
function setupNavigation() {
  const navItems = document.querySelectorAll('.sidebar li');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove 'active' class from all nav items
      document.querySelectorAll('.sidebar li').forEach(nav => nav.classList.remove('active'));
      // Add 'active' class to the clicked nav item
      item.classList.add('active');
      showSection(item.getAttribute('data-section'));
    });
  });
}

function showSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('main > section');
  sections.forEach(section => {
    section.classList.remove('active-section');
    section.classList.add('hidden-section');
  });

  // Show the selected section
  const activeSection = document.getElementById(sectionId);
  activeSection.classList.remove('hidden-section');
  activeSection.classList.add('active-section');
}

// Load Dashboard Metrics
function loadDashboardMetrics() {
  // Total Employees
  document.getElementById('totalEmployees').textContent = employees.length;

  // Upcoming Payroll
  const upcomingPayrolls = payrollRecords.filter(record => new Date(record.date) > new Date());
  upcomingPayrolls.sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextPayroll = upcomingPayrolls[0];
  document.getElementById('upcomingPayroll').textContent = nextPayroll ? nextPayroll.date : 'N/A';

  // Active Benefits
  const activeBenefits = employees.filter(emp => emp.benefits).length;
  document.getElementById('activeBenefits').textContent = activeBenefits;

  // Leave Requests
  const leaveRequests = employees.filter(emp => emp.status === 'on leave').length;
  document.getElementById('leaveRequests').textContent = leaveRequests;

  // Load Charts
  loadDashboardCharts();
}

// Load Charts
function loadDashboardCharts() {
  // Employee Growth Chart
  const ctx1 = document.getElementById('employeeGrowthChart').getContext('2d');
  const employeeGrowthChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: ['Jan', 'Apr', 'Jul', 'Oct'],
      datasets: [{
        label: 'Employees',
        data: [20, 25, 30, employees.length],
        borderColor: '#007bff',
        fill: false
      }]
    }
  });

  // Attendance Trends Chart
  const ctx2 = document.getElementById('attendanceTrendsChart').getContext('2d');
  const attendanceTrendsChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Absences',
        data: [2, 3, 1, 4],
        backgroundColor: '#dc3545'
      }]
    }
  });
}

// Load Employee Management Module
function loadEmployeeManagement() {
  // Populate Departments and Roles in Filters
  const departmentFilter = document.getElementById('departmentFilter');
  departmentFilter.innerHTML = '<option value="">All Departments</option>';
  departments.forEach(dept => {
    const option = document.createElement('option');
    option.value = dept;
    option.textContent = dept;
    departmentFilter.appendChild(option);
  });

  const roleFilter = document.getElementById('roleFilter');
  roleFilter.innerHTML = '<option value="">All Roles</option>';
  roles.forEach(role => {
    const option = document.createElement('option');
    option.value = role;
    option.textContent = role;
    roleFilter.appendChild(option);
  });

  // Load Employee Table
  displayEmployees();

  // Add Employee Button Event
  document.getElementById('addEmployeeBtn').addEventListener('click', () => {
    openEmployeeModal();
  });

  // Employee Search and Filter Events
  document.getElementById('employeeSearch').addEventListener('input', displayEmployees);
  document.getElementById('departmentFilter').addEventListener('change', displayEmployees);
  document.getElementById('roleFilter').addEventListener('change', displayEmployees);
  document.getElementById('statusFilter').addEventListener('change', displayEmployees);
}

// Display Employees
function displayEmployees() {
  const employeeTableBody = document.getElementById('employeeTableBody');
  employeeTableBody.innerHTML = '';
  const searchQuery = document.getElementById('employeeSearch').value.toLowerCase();
  const departmentFilter = document.getElementById('departmentFilter').value;
  const roleFilter = document.getElementById('roleFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;

  const filteredEmployees = employees.filter(emp => {
    return (
      (emp.name.toLowerCase().includes(searchQuery) ||
        emp.department.toLowerCase().includes(searchQuery) ||
        emp.position.toLowerCase().includes(searchQuery)) &&
      (departmentFilter === '' || emp.department === departmentFilter) &&
      (roleFilter === '' || emp.position === roleFilter) &&
      (statusFilter === '' || emp.status === statusFilter)
    );
  });

  filteredEmployees.forEach(emp => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.position}</td>
      <td>${emp.department}</td>
      <td>${emp.status}</td>
      <td class="actions">
        <button class="edit-btn" data-id="${emp.id}"><i class="fas fa-edit"></i></button>
        <button class="delete-btn" data-id="${emp.id}"><i class="fas fa-trash-alt"></i></button>
      </td>
    `;
    row.addEventListener('click', (e) => {
      if (!e.target.closest('.actions')) {
        showEmployeeProfile(emp);
      }
    });
    employeeTableBody.appendChild(row);
  });

  // Edit and Delete Buttons
  const editButtons = document.querySelectorAll('.edit-btn');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const empId = e.currentTarget.getAttribute('data-id');
      const employee = employees.find(emp => emp.id === empId);
      openEmployeeModal(employee);
    });
  });

  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const empId = e.currentTarget.getAttribute('data-id');
      deleteEmployee(empId);
    });
  });
}

// Show Employee Profile
function showEmployeeProfile(employee) {
  const profilePreview = document.querySelector('.profile-preview');
  profilePreview.classList.remove('hidden');
  document.getElementById('profileName').textContent = employee.name;
  document.getElementById('profileContact').textContent = employee.contact;
  document.getElementById('profilePosition').textContent = employee.position;

  // Job History
  const jobHistoryList = document.getElementById('jobHistoryList');
  jobHistoryList.innerHTML = '';
  if (employee.jobHistory) {
    employee.jobHistory.forEach(job => {
      const li = document.createElement('li');
      li.textContent = job;
      jobHistoryList.appendChild(li);
    });
  }

  // Benefits Enrollment
  document.getElementById('benefitsEnrollment').textContent = employee.benefits || 'N/A';

  // Close Button
  document.getElementById('closeProfilePreview').addEventListener('click', () => {
    profilePreview.classList.add('hidden');
  });
}

// Open Employee Modal
function openEmployeeModal(employee = null) {
  const modal = document.getElementById('employeeModal');
  const form = document.getElementById('employeeForm');
  const title = document.getElementById('employeeModalTitle');

  if (employee) {
    title.textContent = 'Edit Employee';
    document.getElementById('employeeName').value = employee.name;
    document.getElementById('employeePosition').value = employee.position;
    document.getElementById('employeeDepartment').value = employee.department;
    document.getElementById('employeeStatus').value = employee.status;
    document.getElementById('employeeContact').value = employee.contact;
    document.getElementById('employeeBenefits').value = employee.benefits;
    form.setAttribute('data-id', employee.id);
  } else {
    title.textContent = 'Add Employee';
    form.reset();
    form.removeAttribute('data-id');
  }

  modal.classList.remove('hidden');

  // Close Modal Event
  document.getElementById('closeEmployeeModal').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Form Submission
  form.onsubmit = function(e) {
    e.preventDefault();
    const employeeData = {
      id: form.getAttribute('data-id') || Date.now().toString(),
      name: document.getElementById('employeeName').value,
      position: document.getElementById('employeePosition').value,
      department: document.getElementById('employeeDepartment').value,
      status: document.getElementById('employeeStatus').value,
      contact: document.getElementById('employeeContact').value,
      benefits: document.getElementById('employeeBenefits').value,
      jobHistory: employee ? employee.jobHistory : [],
    };

    if (employee) {
      // Update Employee
      const index = employees.findIndex(emp => emp.id === employee.id);
      employees[index] = employeeData;
    } else {
      // Add Employee
      employees.push(employeeData);
    }

    localStorage.setItem('employees', JSON.stringify(employees));
    displayEmployees();
    modal.classList.add('hidden');
    loadDashboardMetrics(); // Update dashboard metrics
  };
}

// Delete Employee
function deleteEmployee(empId) {
  if (confirm('Are you sure you want to delete this employee?')) {
    employees = employees.filter(emp => emp.id !== empId);
    localStorage.setItem('employees', JSON.stringify(employees));
    displayEmployees();
    loadDashboardMetrics(); // Update dashboard metrics
  }
}

// Load Payroll Module
function loadPayrollModule() {
  displayPayrollRecords();

  // Add Payroll Button Event
  document.getElementById('addPayrollBtn').addEventListener('click', () => {
    openPayrollModal();
  });
}

// Display Payroll Records
function displayPayrollRecords() {
  const payrollTableBody = document.getElementById('payrollTableBody');
  payrollTableBody.innerHTML = '';

  payrollRecords.forEach(record => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.date}</td>
      <td>${record.status}</td>
      <td>${record.totalAmount}</td>
      <td class="actions">
        <button class="delete-btn" data-id="${record.id}"><i class="fas fa-trash-alt"></i></button>
      </td>
    `;
    payrollTableBody.appendChild(row);
  });

  // Delete Buttons
  const deleteButtons = document.querySelectorAll('.payroll-table .delete-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const recordId = e.currentTarget.getAttribute('data-id');
      deletePayrollRecord(recordId);
    });
  });

  // Next Scheduled Payroll
  const upcomingPayrolls = payrollRecords.filter(record => new Date(record.date) > new Date());
  upcomingPayrolls.sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextPayroll = upcomingPayrolls[0];
  document.getElementById('nextPayrollDate').textContent = nextPayroll ? nextPayroll.date : 'N/A';

  // Update Dashboard Metrics
  loadDashboardMetrics();
}

// Open Payroll Modal
function openPayrollModal() {
  const modal = document.getElementById('payrollModal');
  const form = document.getElementById('payrollForm');

  form.reset();
  modal.classList.remove('hidden');

  // Close Modal Event
  document.getElementById('closePayrollModal').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Form Submission
  form.onsubmit = function(e) {
    e.preventDefault();
    const payrollData = {
      id: Date.now().toString(),
      date: document.getElementById('payrollDate').value,
      status: document.getElementById('payrollStatus').value,
      totalAmount: document.getElementById('payrollAmount').value,
    };

    payrollRecords.push(payrollData);
    localStorage.setItem('payrollRecords', JSON.stringify(payrollRecords));
    displayPayrollRecords();
    modal.classList.add('hidden');
  };
}

// Delete Payroll Record
function deletePayrollRecord(recordId) {
  if (confirm('Are you sure you want to delete this payroll record?')) {
    payrollRecords = payrollRecords.filter(record => record.id !== recordId);
    localStorage.setItem('payrollRecords', JSON.stringify(payrollRecords));
    displayPayrollRecords();
  }
}

// Load Benefits Module
function loadBenefitsModule() {
  displayBenefitPlans();

  // Add Benefit Plan Button Event
  document.getElementById('addBenefitPlanBtn').addEventListener('click', () => {
    openBenefitPlanModal();
  });

  // Enrollment Status
  const totalEnrolled = employees.filter(emp => emp.benefits).length;
  const pendingEnrollments = employees.length - totalEnrolled;
  document.getElementById('totalEnrolled').textContent = totalEnrolled;
  document.getElementById('pendingEnrollments').textContent = pendingEnrollments;

  // Eligibility Requirements
  document.getElementById('eligibilityRequirements').textContent = 'All full-time employees are eligible for benefits.';
}

// Display Benefit Plans
function displayBenefitPlans() {
  const benefitsPlanList = document.getElementById('benefitsPlanList');
  benefitsPlanList.innerHTML = '';

  benefitPlans.forEach(plan => {
    const li = document.createElement('li');
    li.textContent = `${plan.name} - ${plan.description}`;
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.addEventListener('click', () => {
      deleteBenefitPlan(plan.id);
    });
    li.appendChild(deleteBtn);
    benefitsPlanList.appendChild(li);
  });
}

// Open Benefit Plan Modal
function openBenefitPlanModal() {
  const modal = document.getElementById('benefitPlanModal');
  const form = document.getElementById('benefitPlanForm');

  form.reset();
  modal.classList.remove('hidden');

  // Close Modal Event
  document.getElementById('closeBenefitPlanModal').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Form Submission
  form.onsubmit = function(e) {
    e.preventDefault();
    const benefitPlanData = {
      id: Date.now().toString(),
      name: document.getElementById('benefitPlanName').value,
      description: document.getElementById('benefitPlanDescription').value,
    };

    benefitPlans.push(benefitPlanData);
    localStorage.setItem('benefitPlans', JSON.stringify(benefitPlans));
    displayBenefitPlans();
    modal.classList.add('hidden');
  };
}

// Delete Benefit Plan
function deleteBenefitPlan(planId) {
  if (confirm('Are you sure you want to delete this benefit plan?')) {
    benefitPlans = benefitPlans.filter(plan => plan.id !== planId);
    localStorage.setItem('benefitPlans', JSON.stringify(benefitPlans));
    displayBenefitPlans();
  }
}

// Load Time & Attendance Module
function loadTimeAttendanceModule() {
  displayTimesheets();

  // Add Time Entry Button Event
  document.getElementById('addTimeEntryBtn').addEventListener('click', () => {
    openTimeEntryModal();
  });

  // Clock-in/Clock-out Times
  document.getElementById('clockInOutSummary').textContent = 'Average clock-in time: 9:00 AM, Average clock-out time: 5:00 PM';

  // Leave Requests
  const leaveRequestsList = document.getElementById('leaveRequestsList');
  const leaveRequests = employees.filter(emp => emp.status === 'on leave');
  leaveRequestsList.innerHTML = '';
  leaveRequests.forEach(emp => {
    const li = document.createElement('li');
    li.textContent = `${emp.name} has requested leave.`;
    leaveRequestsList.appendChild(li);
  });

  // Overtime Approvals
  const overtimeApprovalsList = document.getElementById('overtimeApprovalsList');
  // Sample data
  overtimeApprovalsList.innerHTML = '<li>No overtime approvals pending.</li>';
}

// Display Timesheets
function displayTimesheets() {
  const timesheetTableBody = document.getElementById('timesheetTableBody');
  timesheetTableBody.innerHTML = '';

  timesheets.forEach(entry => {
    const employee = employees.find(emp => emp.id === entry.employeeId);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${employee ? employee.name : 'Unknown'}</td>
      <td>${entry.hoursLogged}</td>
      <td class="actions">
        <button class="delete-btn" data-id="${entry.id}"><i class="fas fa-trash-alt"></i></button>
      </td>
    `;
    timesheetTableBody.appendChild(row);
  });

  // Delete Buttons
  const deleteButtons = document.querySelectorAll('.timesheet-table .delete-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const entryId = e.currentTarget.getAttribute('data-id');
      deleteTimeEntry(entryId);
    });
  });
}

// Open Time Entry Modal
function openTimeEntryModal() {
  const modal = document.getElementById('timeEntryModal');
  const form = document.getElementById('timeEntryForm');

  form.reset();
  modal.classList.remove('hidden');

  // Populate Employee Options
  const employeeSelect = document.getElementById('timeEntryEmployee');
  employeeSelect.innerHTML = '';
  employees.forEach(emp => {
    const option = document.createElement('option');
    option.value = emp.id;
    option.textContent = emp.name;
    employeeSelect.appendChild(option);
  });

  // Close Modal Event
  document.getElementById('closeTimeEntryModal').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Form Submission
  form.onsubmit = function(e) {
    e.preventDefault();
    const timeEntryData = {
      id: Date.now().toString(),
      employeeId: document.getElementById('timeEntryEmployee').value,
      hoursLogged: document.getElementById('timeEntryHours').value,
    };

    timesheets.push(timeEntryData);
    localStorage.setItem('timesheets', JSON.stringify(timesheets));
    displayTimesheets();
    modal.classList.add('hidden');
  };
}

// Delete Time Entry
function deleteTimeEntry(entryId) {
  if (confirm('Are you sure you want to delete this time entry?')) {
    timesheets = timesheets.filter(entry => entry.id !== entryId);
    localStorage.setItem('timesheets', JSON.stringify(timesheets));
    displayTimesheets();
  }
}

// Load Reports Module
function loadReportsModule() {
  // Payroll Costs Chart
  const ctx1 = document.getElementById('payrollCostsChart').getContext('2d');
  const payrollCostsChart = new Chart(ctx1, {
    type: 'pie',
    data: {
      labels: ['Salaries', 'Benefits', 'Taxes'],
      datasets: [{
        data: [60, 25, 15],
        backgroundColor: ['#007bff', '#28a745', '#ffc107']
      }]
    }
  });

  // Attendance Records Chart
  const ctx2 = document.getElementById('attendanceRecordsChart').getContext('2d');
  const attendanceRecordsChart = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Attendance',
        data: [98, 95, 97, 96],
        borderColor: '#007bff',
        fill: false
      }]
    }
  });

  // Employee Satisfaction Scores Chart
  const ctx3 = document.getElementById('satisfactionScoresChart').getContext('2d');
  const satisfactionScoresChart = new Chart(ctx3, {
    type: 'bar',
    data: {
      labels: ['Work Environment', 'Compensation', 'Growth Opportunities'],
      datasets: [{
        label: 'Satisfaction Score',
        data: [4.2, 3.8, 4.0],
        backgroundColor: '#28a745'
      }]
    }
  });

  // Report Generation Form Submission
  document.getElementById('reportForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Generate report based on selected options
    alert('Report generated successfully!');
  });

  // Download and Print Buttons
  document.getElementById('downloadReport').addEventListener('click', () => {
    alert('Report downloaded successfully!');
  });

  document.getElementById('printReport').addEventListener('click', () => {
    window.print();
  });
}

// Load Settings Module
function loadSettingsModule() {
  // Settings options can be implemented as needed
}