// Expense Tracker - script.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transaction-form');
    const transactionListElement = document.getElementById('transaction-list');
    const totalAmountElement = document.getElementById('total-amount');
    const filterCategoryElement = document.getElementById('filter-category');

    // Load transactions from localStorage or initialize empty array
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Render functions
    const renderTransactions = (filter = '') => {
        transactionListElement.innerHTML = '';
        let total = 0;

        const filteredTransactions = transactions.filter(t => 
            filter === '' || t.category === filter
        );

        filteredTransactions.forEach((transaction, index) => {
            total += parseFloat(transaction.amount);
            const li = document.createElement('li');
            li.className = 'transaction-item';
            li.innerHTML = `
                <div class="transaction-info">
                    <span class="transaction-name">${transaction.name}</span>
                    <span class="transaction-category">${transaction.category}</span>
                </div>
                <div class="transaction-details">
                    <span class="transaction-amount">Rp ${parseFloat(transaction.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    <span class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</span>
                    <button class="delete-btn" data-index="${index}">Hapus</button>
                </div>
            `;
            transactionListElement.appendChild(li);
        });

        totalAmountElement.textContent = `Rp ${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    };

    const saveTransactions = () => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    };

    // Event listeners
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('transaction-name').value.trim();
        const category = document.getElementById('transaction-category').value;
        const amount = document.getElementById('transaction-amount').value;
        const date = document.getElementById('transaction-date').value;

        if (!name || !category || !amount || !date) {
            alert('Mohon lengkapi semua field');
            return;
        }

        transactions.push({
            name,
            category,
            amount: parseFloat(amount),
            date
        });

        saveTransactions();
        renderTransactions(filterCategoryElement.value);
        form.reset();
        // Reset category to placeholder
        document.getElementById('transaction-category').selectedIndex = 0;
    });

    transactionListElement.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            transactions.splice(index, 1);
            saveTransactions();
            renderTransactions(filterCategoryElement.value);
        }
    });

    filterCategoryElement.addEventListener('change', (e) => {
        renderTransactions(e.target.value);
    });

    // Initial render
    renderTransactions('');
});