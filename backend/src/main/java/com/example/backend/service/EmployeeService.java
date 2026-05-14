package com.example.backend.service;

import com.example.backend.constant.AppConstants;
import com.example.backend.constant.TransactionCategoryKeys;
import com.example.backend.dto.request.EmployeeRequest;
import com.example.backend.dto.request.PayrollRecordRequest;
import com.example.backend.dto.response.EmployeeResponse;
import com.example.backend.dto.response.PayrollRecordResponse;
import com.example.backend.entity.Employee;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.entity.PayrollRecord;
import com.example.backend.entity.Transaction;
import com.example.backend.entity.TransactionCategory;
import com.example.backend.enums.TransactionType;
import com.example.backend.exception.BusinessException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.EmployeeMapper;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.repository.PayrollRecordRepository;
import com.example.backend.repository.TransactionCategoryRepository;
import com.example.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PayrollRecordRepository payrollRecordRepository;
    private final TransactionCategoryRepository transactionCategoryRepository;
    private final TransactionRepository transactionRepository;
    private final EmployeeMapper employeeMapper;

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable)
                .map(this::toEmployeeResponse);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployee(UUID id) {
        return toEmployeeResponse(findEmployee(id));
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        Employee employee = new Employee();
        applyEmployeeRequest(employee, request);

        return toEmployeeResponse(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse updateEmployee(UUID id, EmployeeRequest request) {
        Employee employee = findEmployee(id);
        applyEmployeeRequest(employee, request);

        return toEmployeeResponse(employee);
    }

    @Transactional
    public void deleteEmployee(UUID id) {
        Employee employee = findEmployee(id);
        employeeRepository.delete(employee);
    }

    @Transactional(readOnly = true)
    public Page<PayrollRecordResponse> getPayrollRecords(UUID employeeId, Pageable pageable) {
        Employee employee = findEmployee(employeeId);

        return payrollRecordRepository
                .findAllByEmployeeOrderByPaymentDateDesc(employee, pageable)
                .map(this::toPayrollResponse);
    }

    @Transactional
    public PayrollRecordResponse createPayrollRecord(UUID employeeId, PayrollRecordRequest request) {
        Employee employee = findEmployee(employeeId);

        PayrollRecord payrollRecord = new PayrollRecord();
        payrollRecord.setEmployee(employee);
        payrollRecord.setAmount(request.amount());
        payrollRecord.setCurrency(AppConstants.CURRENCY_RON);
        payrollRecord.setPaymentDate(request.paymentDate());
        payrollRecord.setPeriodStart(request.periodStart());
        payrollRecord.setPeriodEnd(request.periodEnd());
        payrollRecord.setNotes(request.notes());

        PayrollRecord savedPayroll = payrollRecordRepository.save(payrollRecord);
        Transaction transaction = createSalaryExpenseTransaction(savedPayroll, request.paymentMethod());

        return employeeMapper.toPayrollRecordResponse(savedPayroll, transaction);
    }

    @Transactional
    public PayrollRecordResponse updatePayrollRecord(UUID payrollRecordId, PayrollRecordRequest request) {
        PayrollRecord payrollRecord = findPayrollRecord(payrollRecordId);

        payrollRecord.setAmount(request.amount());
        payrollRecord.setPaymentDate(request.paymentDate());
        payrollRecord.setPeriodStart(request.periodStart());
        payrollRecord.setPeriodEnd(request.periodEnd());
        payrollRecord.setNotes(request.notes());

        Transaction transaction = transactionRepository.findByPayrollRecord(payrollRecord)
                .orElseGet(() -> createSalaryExpenseTransaction(payrollRecord, request.paymentMethod()));

        transaction.setAmount(request.amount());
        transaction.setTransactionDate(request.paymentDate());
        transaction.setNotes(salaryTransactionNotes(payrollRecord));
        transaction.setPaymentMethod(resolvePaymentMethod(request.paymentMethod()));

        return employeeMapper.toPayrollRecordResponse(payrollRecord, transaction);
    }

    @Transactional
    public void deletePayrollRecord(UUID payrollRecordId) {
        PayrollRecord payrollRecord = findPayrollRecord(payrollRecordId);

        transactionRepository.findByPayrollRecord(payrollRecord)
                .ifPresent(transactionRepository::delete);

        payrollRecordRepository.delete(payrollRecord);
    }

    private Transaction createSalaryExpenseTransaction(
            PayrollRecord payrollRecord,
            PaymentMethod paymentMethod
    ) {
        TransactionCategory salariesCategory = transactionCategoryRepository
                .findBySystemKey(TransactionCategoryKeys.SALARIES)
                .orElseThrow(() -> new BusinessException("Salaries transaction category is missing."));

        Transaction transaction = new Transaction();
        transaction.setType(TransactionType.EXPENSE);
        transaction.setAmount(payrollRecord.getAmount());
        transaction.setCurrency(AppConstants.CURRENCY_RON);
        transaction.setTransactionDate(payrollRecord.getPaymentDate());
        transaction.setCategory(salariesCategory);
        transaction.setPaymentMethod(resolvePaymentMethod(paymentMethod));
        transaction.setNotes(salaryTransactionNotes(payrollRecord));
        transaction.setEmployee(payrollRecord.getEmployee());
        transaction.setPayrollRecord(payrollRecord);

        return transactionRepository.save(transaction);
    }

    private PaymentMethod resolvePaymentMethod(PaymentMethod paymentMethod) {
        return paymentMethod == null ? PaymentMethod.BANK_TRANSFER : paymentMethod;
    }

    private String salaryTransactionNotes(PayrollRecord payrollRecord) {
        return "Salary payment for " + payrollRecord.getEmployee().fullName();
    }

    private EmployeeResponse toEmployeeResponse(Employee employee) {
        var lastPayroll = payrollRecordRepository
                .findFirstByEmployeeOrderByPaymentDateDesc(employee);

        return employeeMapper.toEmployeeResponse(
                employee,
                lastPayroll.map(PayrollRecord::getPaymentDate).orElse(null),
                payrollRecordRepository.countByEmployee(employee)
        );
    }

    private PayrollRecordResponse toPayrollResponse(PayrollRecord payrollRecord) {
        Transaction transaction = transactionRepository.findByPayrollRecord(payrollRecord)
                .orElse(null);

        return employeeMapper.toPayrollRecordResponse(payrollRecord, transaction);
    }

    private void applyEmployeeRequest(Employee employee, EmployeeRequest request) {
        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setPhoneNumber(request.phoneNumber());
        employee.setEmail(request.email());
        employee.setSalaryAmount(request.salaryAmount());
        employee.setSalaryCurrency(AppConstants.CURRENCY_RON);
        employee.setRole(request.role());
        employee.setEmploymentStatus(request.employmentStatus());
        employee.setFirstWorkingDay(request.firstWorkingDay());
        employee.setEmergencyContactName(request.emergencyContactName());
        employee.setEmergencyContactPhone(request.emergencyContactPhone());
        employee.setNotes(request.notes());
    }

    private Employee findEmployee(UUID id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found "));
    }

    private PayrollRecord findPayrollRecord(UUID id) {
        return payrollRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found"));
    }
}