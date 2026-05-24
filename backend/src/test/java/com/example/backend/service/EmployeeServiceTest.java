package com.example.backend.service;

import com.example.backend.constant.TransactionCategoryKeys;
import com.example.backend.dto.request.EmployeeRequest;
import com.example.backend.dto.request.PayrollRecordRequest;
import com.example.backend.dto.response.EmployeeResponse;
import com.example.backend.dto.response.PayrollRecordResponse;
import com.example.backend.entity.Employee;
import com.example.backend.entity.PayrollRecord;
import com.example.backend.entity.Transaction;
import com.example.backend.entity.TransactionCategory;
import com.example.backend.enums.EmployeeStatus;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.TransactionType;
import com.example.backend.exception.BusinessException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.EmployeeMapper;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.repository.PayrollRecordRepository;
import com.example.backend.repository.TransactionCategoryRepository;
import com.example.backend.repository.TransactionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@DisplayName("EmployeeService")
class EmployeeServiceTest {

    private static final UUID EMPLOYEE_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID PAYROLL_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID TRANSACTION_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");
    private static final String FIRST_NAME = "Alex";
    private static final String LAST_NAME = "Popescu";
    private static final String PHONE_NUMBER = "+40740000000";
    private static final String EMAIL = "alex@example.com";
    private static final String ROLE = "Cook";
    private static final BigDecimal SALARY = BigDecimal.valueOf(3500);
    private static final LocalDate FIRST_WORKING_DAY = LocalDate.of(2025, 1, 1);
    private static final LocalDate PAYMENT_DATE = LocalDate.of(2026, 5, 1);

    private final EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
    private final PayrollRecordRepository payrollRecordRepository = mock(PayrollRecordRepository.class);
    private final TransactionCategoryRepository transactionCategoryRepository = mock(TransactionCategoryRepository.class);
    private final TransactionRepository transactionRepository = mock(TransactionRepository.class);
    private final EmployeeMapper employeeMapper = mock(EmployeeMapper.class);

    private final EmployeeService employeeService = new EmployeeService(
            employeeRepository,
            payrollRecordRepository,
            transactionCategoryRepository,
            transactionRepository,
            employeeMapper
    );

    @Nested
    @DisplayName("employees")
    class Employees {

        @Test
        @DisplayName("should return paginated employee responses when employees exist")
        void shouldReturnPaginatedEmployeeResponsesWhenEmployeesExist() {
            Employee employee = employee();
            EmployeeResponse employeeResponse = employeeResponse();
            PageRequest pageable = PageRequest.of(0, 20);

            when(employeeRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(employee)));
            when(payrollRecordRepository.findFirstByEmployeeOrderByPaymentDateDesc(employee)).thenReturn(Optional.empty());
            when(payrollRecordRepository.countByEmployee(employee)).thenReturn(0L);
            when(employeeMapper.toEmployeeResponse(employee, null, 0L)).thenReturn(employeeResponse);

            Page<EmployeeResponse> result = employeeService.getEmployees(pageable);

            assertThat(result.getContent()).containsExactly(employeeResponse);
            verify(employeeRepository).findAll(pageable);
        }

        @Test
        @DisplayName("should return employee response when employee exists")
        void shouldReturnEmployeeResponseWhenEmployeeExists() {
            Employee employee = employee();
            PayrollRecord payrollRecord = payrollRecord(employee);
            EmployeeResponse employeeResponse = employeeResponse();

            when(employeeRepository.findById(EMPLOYEE_ID)).thenReturn(Optional.of(employee));
            when(payrollRecordRepository.findFirstByEmployeeOrderByPaymentDateDesc(employee))
                    .thenReturn(Optional.of(payrollRecord));
            when(payrollRecordRepository.countByEmployee(employee)).thenReturn(1L);
            when(employeeMapper.toEmployeeResponse(employee, PAYMENT_DATE, 1L)).thenReturn(employeeResponse);

            EmployeeResponse result = employeeService.getEmployee(EMPLOYEE_ID);

            assertThat(result).isEqualTo(employeeResponse);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when employee does not exist")
        void shouldThrowResourceNotFoundExceptionWhenEmployeeDoesNotExist() {
            when(employeeRepository.findById(EMPLOYEE_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> employeeService.getEmployee(EMPLOYEE_ID))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Employee not found ");
        }

        @Test
        @DisplayName("should create employee and return response when request is valid")
        void shouldCreateEmployeeAndReturnResponseWhenRequestIsValid() {
            EmployeeRequest request = employeeRequest();
            Employee savedEmployee = employee();
            EmployeeResponse employeeResponse = employeeResponse();

            when(employeeRepository.save(any(Employee.class))).thenReturn(savedEmployee);
            when(payrollRecordRepository.findFirstByEmployeeOrderByPaymentDateDesc(savedEmployee)).thenReturn(Optional.empty());
            when(payrollRecordRepository.countByEmployee(savedEmployee)).thenReturn(0L);
            when(employeeMapper.toEmployeeResponse(savedEmployee, null, 0L)).thenReturn(employeeResponse);

            EmployeeResponse result = employeeService.createEmployee(request);

            ArgumentCaptor<Employee> employeeCaptor = ArgumentCaptor.forClass(Employee.class);
            verify(employeeRepository).save(employeeCaptor.capture());

            Employee captured = employeeCaptor.getValue();
            assertThat(captured.getFirstName()).isEqualTo(FIRST_NAME);
            assertThat(captured.getLastName()).isEqualTo(LAST_NAME);
            assertThat(captured.getSalaryAmount()).isEqualByComparingTo(SALARY);
            assertThat(result).isEqualTo(employeeResponse);
        }

        @Test
        @DisplayName("should update employee and return response when employee exists")
        void shouldUpdateEmployeeAndReturnResponseWhenEmployeeExists() {
            Employee employee = employee();
            EmployeeRequest request = employeeRequest();
            EmployeeResponse employeeResponse = employeeResponse();

            when(employeeRepository.findById(EMPLOYEE_ID)).thenReturn(Optional.of(employee));
            when(payrollRecordRepository.findFirstByEmployeeOrderByPaymentDateDesc(employee)).thenReturn(Optional.empty());
            when(payrollRecordRepository.countByEmployee(employee)).thenReturn(0L);
            when(employeeMapper.toEmployeeResponse(employee, null, 0L)).thenReturn(employeeResponse);

            EmployeeResponse result = employeeService.updateEmployee(EMPLOYEE_ID, request);

            assertThat(employee.getFirstName()).isEqualTo(FIRST_NAME);
            assertThat(employee.getPhoneNumber()).isEqualTo(PHONE_NUMBER);
            assertThat(result).isEqualTo(employeeResponse);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when updating missing employee")
        void shouldThrowResourceNotFoundExceptionWhenUpdatingMissingEmployee() {
            when(employeeRepository.findById(EMPLOYEE_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> employeeService.updateEmployee(EMPLOYEE_ID, employeeRequest()))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Employee not found ");
        }

        @Test
        @DisplayName("should delete employee when employee exists")
        void shouldDeleteEmployeeWhenEmployeeExists() {
            Employee employee = employee();

            when(employeeRepository.findById(EMPLOYEE_ID)).thenReturn(Optional.of(employee));

            employeeService.deleteEmployee(EMPLOYEE_ID);

            verify(employeeRepository).delete(employee);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when deleting missing employee")
        void shouldThrowResourceNotFoundExceptionWhenDeletingMissingEmployee() {
            when(employeeRepository.findById(EMPLOYEE_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> employeeService.deleteEmployee(EMPLOYEE_ID))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Employee not found ");

            verify(employeeRepository, never()).delete(any());
        }
    }

    @Nested
    @DisplayName("payroll")
    class Payroll {

        @Test
        @DisplayName("should return paginated payroll records when employee exists")
        void shouldReturnPaginatedPayrollRecordsWhenEmployeeExists() {
            Employee employee = employee();
            PayrollRecord payrollRecord = payrollRecord(employee);
            Transaction transaction = transaction(employee, payrollRecord);
            PayrollRecordResponse response = payrollResponse();
            PageRequest pageable = PageRequest.of(0, 20);

            when(employeeRepository.findById(EMPLOYEE_ID)).thenReturn(Optional.of(employee));
            when(payrollRecordRepository.findAllByEmployeeOrderByPaymentDateDesc(employee, pageable))
                    .thenReturn(new PageImpl<>(List.of(payrollRecord)));
            when(transactionRepository.findByPayrollRecord(payrollRecord)).thenReturn(Optional.of(transaction));
            when(employeeMapper.toPayrollRecordResponse(payrollRecord, transaction)).thenReturn(response);

            Page<PayrollRecordResponse> result = employeeService.getPayrollRecords(EMPLOYEE_ID, pageable);

            assertThat(result.getContent()).containsExactly(response);
        }

        @Test
        @DisplayName("should create payroll record and automatic salary expense transaction")
        void shouldCreatePayrollRecordAndAutomaticSalaryExpenseTransaction() {
            Employee employee = employee();
            PayrollRecordRequest request = payrollRequest(PaymentMethod.CASH);
            PayrollRecord savedPayroll = payrollRecord(employee);
            TransactionCategory salariesCategory = salariesCategory();
            Transaction savedTransaction = transaction(employee, savedPayroll);
            PayrollRecordResponse response = payrollResponse();

            when(employeeRepository.findById(EMPLOYEE_ID)).thenReturn(Optional.of(employee));
            when(payrollRecordRepository.save(any(PayrollRecord.class))).thenReturn(savedPayroll);
            when(transactionCategoryRepository.findBySystemKey(TransactionCategoryKeys.SALARIES))
                    .thenReturn(Optional.of(salariesCategory));
            when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);
            when(employeeMapper.toPayrollRecordResponse(savedPayroll, savedTransaction)).thenReturn(response);

            PayrollRecordResponse result = employeeService.createPayrollRecord(EMPLOYEE_ID, request);

            ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);
            verify(transactionRepository).save(transactionCaptor.capture());

            Transaction captured = transactionCaptor.getValue();
            assertThat(captured.getType()).isEqualTo(TransactionType.EXPENSE);
            assertThat(captured.getAmount()).isEqualByComparingTo(SALARY);
            assertThat(captured.getPaymentMethod()).isEqualTo(PaymentMethod.CASH);
            assertThat(captured.getCategory()).isEqualTo(salariesCategory);
            assertThat(captured.getEmployee()).isEqualTo(employee);
            assertThat(captured.getPayrollRecord()).isEqualTo(savedPayroll);
            assertThat(result).isEqualTo(response);
        }

        @Test
        @DisplayName("should default payroll payment method to bank transfer when request payment method is null")
        void shouldDefaultPayrollPaymentMethodToBankTransferWhenRequestPaymentMethodIsNull() {
            Employee employee = employee();
            PayrollRecordRequest request = payrollRequest(null);
            PayrollRecord savedPayroll = payrollRecord(employee);
            TransactionCategory salariesCategory = salariesCategory();
            Transaction savedTransaction = transaction(employee, savedPayroll);

            when(employeeRepository.findById(EMPLOYEE_ID)).thenReturn(Optional.of(employee));
            when(payrollRecordRepository.save(any(PayrollRecord.class))).thenReturn(savedPayroll);
            when(transactionCategoryRepository.findBySystemKey(TransactionCategoryKeys.SALARIES))
                    .thenReturn(Optional.of(salariesCategory));
            when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);
            when(employeeMapper.toPayrollRecordResponse(eq(savedPayroll), any(Transaction.class))).thenReturn(payrollResponse());

            employeeService.createPayrollRecord(EMPLOYEE_ID, request);

            ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);
            verify(transactionRepository).save(transactionCaptor.capture());

            assertThat(transactionCaptor.getValue().getPaymentMethod()).isEqualTo(PaymentMethod.BANK_TRANSFER);
        }

        @Test
        @DisplayName("should throw BusinessException when salaries category is missing")
        void shouldThrowBusinessExceptionWhenSalariesCategoryIsMissing() {
            Employee employee = employee();
            PayrollRecord savedPayroll = payrollRecord(employee);

            when(employeeRepository.findById(EMPLOYEE_ID)).thenReturn(Optional.of(employee));
            when(payrollRecordRepository.save(any(PayrollRecord.class))).thenReturn(savedPayroll);
            when(transactionCategoryRepository.findBySystemKey(TransactionCategoryKeys.SALARIES))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> employeeService.createPayrollRecord(EMPLOYEE_ID, payrollRequest(PaymentMethod.CASH)))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage("Salaries transaction category is missing.");
        }

        @Test
        @DisplayName("should update payroll and linked transaction when transaction exists")
        void shouldUpdatePayrollAndLinkedTransactionWhenTransactionExists() {
            Employee employee = employee();
            PayrollRecord payrollRecord = payrollRecord(employee);
            Transaction transaction = transaction(employee, payrollRecord);
            PayrollRecordRequest request = payrollRequest(PaymentMethod.CARD);
            PayrollRecordResponse response = payrollResponse();

            when(payrollRecordRepository.findById(PAYROLL_ID)).thenReturn(Optional.of(payrollRecord));
            when(transactionRepository.findByPayrollRecord(payrollRecord)).thenReturn(Optional.of(transaction));
            when(employeeMapper.toPayrollRecordResponse(payrollRecord, transaction)).thenReturn(response);

            PayrollRecordResponse result = employeeService.updatePayrollRecord(PAYROLL_ID, request);

            assertThat(payrollRecord.getAmount()).isEqualByComparingTo(SALARY);
            assertThat(transaction.getAmount()).isEqualByComparingTo(SALARY);
            assertThat(transaction.getPaymentMethod()).isEqualTo(PaymentMethod.CARD);
            assertThat(result).isEqualTo(response);
        }

        @Test
        @DisplayName("should create linked transaction when updating payroll without existing transaction")
        void shouldCreateLinkedTransactionWhenUpdatingPayrollWithoutExistingTransaction() {
            Employee employee = employee();
            PayrollRecord payrollRecord = payrollRecord(employee);
            TransactionCategory salariesCategory = salariesCategory();
            Transaction transaction = transaction(employee, payrollRecord);

            when(payrollRecordRepository.findById(PAYROLL_ID)).thenReturn(Optional.of(payrollRecord));
            when(transactionRepository.findByPayrollRecord(payrollRecord)).thenReturn(Optional.empty());
            when(transactionCategoryRepository.findBySystemKey(TransactionCategoryKeys.SALARIES))
                    .thenReturn(Optional.of(salariesCategory));
            when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);
            when(employeeMapper.toPayrollRecordResponse(payrollRecord, transaction)).thenReturn(payrollResponse());

            PayrollRecordResponse result = employeeService.updatePayrollRecord(PAYROLL_ID, payrollRequest(null));

            assertThat(result).isEqualTo(payrollResponse());
            verify(transactionRepository).save(any(Transaction.class));
        }

        @Test
        @DisplayName("should delete payroll and linked transaction when both exist")
        void shouldDeletePayrollAndLinkedTransactionWhenBothExist() {
            Employee employee = employee();
            PayrollRecord payrollRecord = payrollRecord(employee);
            Transaction transaction = transaction(employee, payrollRecord);

            when(payrollRecordRepository.findById(PAYROLL_ID)).thenReturn(Optional.of(payrollRecord));
            when(transactionRepository.findByPayrollRecord(payrollRecord)).thenReturn(Optional.of(transaction));

            employeeService.deletePayrollRecord(PAYROLL_ID);

            verify(transactionRepository).delete(transaction);
            verify(payrollRecordRepository).delete(payrollRecord);
        }

        @Test
        @DisplayName("should delete payroll only when linked transaction does not exist")
        void shouldDeletePayrollOnlyWhenLinkedTransactionDoesNotExist() {
            Employee employee = employee();
            PayrollRecord payrollRecord = payrollRecord(employee);

            when(payrollRecordRepository.findById(PAYROLL_ID)).thenReturn(Optional.of(payrollRecord));
            when(transactionRepository.findByPayrollRecord(payrollRecord)).thenReturn(Optional.empty());

            employeeService.deletePayrollRecord(PAYROLL_ID);

            verify(transactionRepository, never()).delete((Transaction) any());
            verify(payrollRecordRepository).delete(payrollRecord);
        }
    }

    private Employee employee() {
        Employee employee = new Employee();
        employee.setId(EMPLOYEE_ID);
        employee.setFirstName(FIRST_NAME);
        employee.setLastName(LAST_NAME);
        employee.setPhoneNumber(PHONE_NUMBER);
        employee.setEmail(EMAIL);
        employee.setSalaryAmount(SALARY);
        employee.setSalaryCurrency("RON");
        employee.setRole(ROLE);
        employee.setEmploymentStatus(EmployeeStatus.ACTIVE);
        employee.setFirstWorkingDay(FIRST_WORKING_DAY);
        employee.setEmergencyContactName("Maria Popescu");
        employee.setEmergencyContactPhone("+40741111111");
        employee.setNotes("Morning shift");
        return employee;
    }

    private EmployeeRequest employeeRequest() {
        return new EmployeeRequest(
                FIRST_NAME,
                LAST_NAME,
                PHONE_NUMBER,
                EMAIL,
                SALARY,
                ROLE,
                EmployeeStatus.ACTIVE,
                FIRST_WORKING_DAY,
                "Maria Popescu",
                "+40741111111",
                "Morning shift"
        );
    }

    private EmployeeResponse employeeResponse() {
        return EmployeeResponse.builder()
                .id(EMPLOYEE_ID)
                .firstName(FIRST_NAME)
                .lastName(LAST_NAME)
                .fullName(FIRST_NAME + " " + LAST_NAME)
                .phoneNumber(PHONE_NUMBER)
                .email(EMAIL)
                .salaryAmount(SALARY)
                .salaryCurrency("RON")
                .role(ROLE)
                .employmentStatus(EmployeeStatus.ACTIVE)
                .firstWorkingDay(FIRST_WORKING_DAY)
                .payrollRecordsCount(0)
                .monthsEmployed(12)
                .build();
    }

    private PayrollRecord payrollRecord(Employee employee) {
        PayrollRecord payrollRecord = new PayrollRecord();
        payrollRecord.setId(PAYROLL_ID);
        payrollRecord.setEmployee(employee);
        payrollRecord.setAmount(SALARY);
        payrollRecord.setCurrency("RON");
        payrollRecord.setPaymentDate(PAYMENT_DATE);
        payrollRecord.setPeriodStart(LocalDate.of(2026, 4, 1));
        payrollRecord.setPeriodEnd(LocalDate.of(2026, 4, 30));
        payrollRecord.setNotes("April salary");
        return payrollRecord;
    }

    private PayrollRecordRequest payrollRequest(PaymentMethod paymentMethod) {
        return new PayrollRecordRequest(
                SALARY,
                PAYMENT_DATE,
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 30),
                paymentMethod,
                "April salary"
        );
    }

    private PayrollRecordResponse payrollResponse() {
        return PayrollRecordResponse.builder()
                .id(PAYROLL_ID)
                .employeeId(EMPLOYEE_ID)
                .employeeName(FIRST_NAME + " " + LAST_NAME)
                .amount(SALARY)
                .currency("RON")
                .paymentDate(PAYMENT_DATE)
                .periodStart(LocalDate.of(2026, 4, 1))
                .periodEnd(LocalDate.of(2026, 4, 30))
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .notes("April salary")
                .transactionId(TRANSACTION_ID)
                .build();
    }

    private TransactionCategory salariesCategory() {
        TransactionCategory category = new TransactionCategory();
        category.setId(UUID.fromString("44444444-4444-4444-4444-444444444444"));
        category.setType(TransactionType.EXPENSE);
        category.setName("Salaries");
        category.setSystemKey(TransactionCategoryKeys.SALARIES);
        category.setActive(true);
        category.setDisplayOrder(40);
        return category;
    }

    private Transaction transaction(Employee employee, PayrollRecord payrollRecord) {
        Transaction transaction = new Transaction();
        transaction.setId(TRANSACTION_ID);
        transaction.setType(TransactionType.EXPENSE);
        transaction.setAmount(SALARY);
        transaction.setCurrency("RON");
        transaction.setTransactionDate(PAYMENT_DATE);
        transaction.setCategory(salariesCategory());
        transaction.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        transaction.setNotes("Salary payment for " + employee.fullName());
        transaction.setEmployee(employee);
        transaction.setPayrollRecord(payrollRecord);
        return transaction;
    }
}