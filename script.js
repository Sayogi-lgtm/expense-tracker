// Expense Tracker V2 - script.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transaction-form');
    const editIndexInput = document.getElementById('edit-index');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const transactionListElement = document.getElementById('transaction-list');
    const totalAmountElement = document.getElementById('total-amount');
    const categoryTotalsElement = document.getElementById('category-totals');
    const chartElement = document.getElementById('expense-chart');
    const filterCategoryElement = document.getElementById('filter-category');
    const searchInput = document.getElementById('search-transaction');

    // Load transactions from localStorage or initialize empty array
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Render functions
    const renderTransactions = () => {
        transactionListElement.innerHTML = '';

        const filterCategory = filterCategoryElement.value;
        const searchTerm = searchInput.value.toLowerCase().trim();

        const filtered = transactions.filter(t => {
            const matchesCategory = filterCategory === '' || t.category === filterCategory;
            const matchesSearch = searchTerm === '' || t.name.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            transactionListElement.innerHTML = '<p>Belum ada transaksi.</p>';
            return;
        }

        filtered.forEach((transaction, index) => {
            // Find original index in transactions array
            const originalIndex = transactions.indexOf(transaction);
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
                    <div class="transaction-actions">
                        <button class="edit-btn" data-index="${originalIndex}">Edit</button>
                        <button class="delete-btn" data-index="${originalIndex}">Hapus</button>
                    </div>
                </div>
            `;
            transactionListElement.appendChild(li);
        });
    };

    const renderSummary = () => {
        const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        totalAmountElement.textContent = `Rp ${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    };

    const renderCategoryTotals = () => {
        const totals = {};
        transactions.forEach(t => {
            const cat = t.category;
            totals[cat] = (totals[cat] || 0) + parseFloat(t.amount);
        });

        categoryTotalsElement.innerHTML = '';
        if (Object.keys(totals).length === 0) {
            categoryTotalsElement.innerHTML = '<p>Belum ada data kategori.</p>';
            return;
        }

        for (const [cat, amount] of Object.entries(totals)) {
            const div = document.createElement('div');
            div.className = 'category-item';
            div.textContent = `${cat}: Rp ${amount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            categoryTotalsElement.appendChild(div);
        }
    };

    const renderChart = () => {
        // Clear chart
        chartElement.innerHTML = '';

        const totals = {};
        transactions.forEach(t => {
            const cat = t.category;
            totals[cat] = (totals[cat] || 0) + parseFloat(t.amount);
        });

        if (Object.keys(totals).length === 0) {
            chartElement.innerHTML = '<p>Belum ada data untuk grafik.</p>';
            return;
        }

        const maxAmount = Math.max(...Object.values(totals));
        const barWidth = 60; // px
        const gap = 15; // px
        let offset = 0;

        for (const [cat, amount] of Object.entries(totals)) {
            const height = (amount / maxAmount) * 100; // percentage of max
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${height}%`;
            bar.style.width = `${barWidth}px`;
            bar.style.left = `${offset}px`;

            const label = document.createElement('div');
            label.className = 'chart-bar-label';
            label.textContent = cat;

            const value = document.createElement('div');
            value.className = 'chart-bar-value';
            value.textContent = `Rp ${amount.toLocaleString(undefined, {minimumFractionDigits: 0})}`;

            bar.appendChild(label);
            bar.appendChild(value);
            chartElement.appendChild(bar);

            offset += barWidth + gap;
        }

        // Set chart container width to fit all bars
        const numBars = Object.keys(totals).length;
        chartElement.style.width = `${numBars * (barWidth + gap) - gap}px`;
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
        const editIndex = parseInt(editIndexInput.value);

        if (!name || !category || !amount || !date) {
            alert('Mohon lengkapi semua field');
            return;
        }

        const transaction = {
            name,
            category,
            amount: parseFloat(amount),
            date
        };

        if (editIndex >= 0 && editIndex < transactions.length) {
            // Update existing
            transactions[editIndex] = transaction;
            cancelEditBtn.style.display = 'none';
            editIndexInput.value = '-1';
            form.querySelector('button[type="submit"]').textContent = 'Tambah Transaksi';
        } else {
            // Add new
            transactions.push(transaction);
        }

        saveTransactions();
        renderAll();
        form.reset();
        document.getElementById('transaction-category').selectedIndex = 0;
    });

    cancelEditBtn.addEventListener('click', () => {
        editIndexInput.value = '-1';
        cancelEditBtn.style.display = 'none';
        form.querySelector('button[type="submit"]').textContent = 'Tambah Transaksi';
        form.reset();
        document.getElementById('transaction-category').selectedIndex = 0;
    });

    transactionListElement.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            if (confirm('Yakin ingin menghapus transaksi ini?')) {
                transactions.splice(index, 1);
                saveTransactions();
                renderAll();
            }
        } else if (e.target.classList.contains('edit-btn')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            const transaction = transactions[index];
            document.getElementById('transaction-name').value = transaction.name;
            document.getElementById('transaction-category').value = transaction.category;
            document.getElementById('transaction-amount').value = transaction.amount;
            document.getElementById('transaction-date').value = transaction.date;
            editIndexInput.value = index;
            cancelEditBtn.style.display = 'inline-block';
            form.querySelector('button[type="submit"]').textContent = 'Update Transaksi';
            // Focus on name field
            document.getElementById('transaction-name').focus();
        }
    });

    filterCategoryElement.addEventListener('change', renderTransactions);
    searchInput.addEventListener('input', renderTransactions);

    // Initial render
    const renderAll = () => {
        renderTransactions();
        renderSummary();
        renderCategoryTotals();
        renderChart();
    };

    renderAll();
});