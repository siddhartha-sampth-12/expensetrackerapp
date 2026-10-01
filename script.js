// ================================
// EXPENSE TRACKER
// ================================


// Get HTML elements
const transactionForm =
    document.getElementById("transactionForm");

const nameInput =
    document.getElementById("name");

const amountInput =
    document.getElementById("amount");

const typeInput =
    document.getElementById("type");

const categoryInput =
    document.getElementById("category");

const dateInput =
    document.getElementById("date");

const descriptionInput =
    document.getElementById("description");

const transactionList =
    document.getElementById("transactionList");

const balanceElement =
    document.getElementById("balance");

const incomeElement =
    document.getElementById("income");

const expenseElement =
    document.getElementById("expense");

const searchInput =
    document.getElementById("search");

const filterType =
    document.getElementById("filterType");

const filterCategory =
    document.getElementById("filterCategory");

const clearAllBtn =
    document.getElementById("clearAllBtn");

const chart =
    document.getElementById("chart");


// ================================
// LOAD DATA
// ================================

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];


// ================================
// SET TODAY'S DATE
// ================================

const today =
    new Date().toISOString().split("T")[0];

dateInput.value = today;


// ================================
// ADD TRANSACTION
// ================================

transactionForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const name =
            nameInput.value.trim();

        const amount =
            parseFloat(amountInput.value);

        const type =
            typeInput.value;

        const category =
            categoryInput.value;

        const date =
            dateInput.value;

        const description =
            descriptionInput.value.trim();


        if (
            name === "" ||
            isNaN(amount) ||
            amount <= 0 ||
            date === ""
        ) {
            alert("Please enter valid details.");
            return;
        }


        const transaction = {

            id: Date.now(),

            name: name,

            amount: amount,

            type: type,

            category: category,

            date: date,

            description: description

        };


        transactions.push(transaction);


        saveTransactions();

        transactionForm.reset();

        dateInput.value = today;

        updateApp();

    }
);


// ================================
// SAVE TO LOCAL STORAGE
// ================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ================================
// UPDATE EVERYTHING
// ================================

function updateApp() {

    updateSummary();

    displayTransactions();

    createChart();

}


// ================================
// UPDATE SUMMARY
// ================================

function updateSummary() {

    let totalIncome = 0;

    let totalExpense = 0;


    transactions.forEach(
        function(transaction) {

            if (transaction.type === "income") {

                totalIncome += transaction.amount;

            } else {

                totalExpense += transaction.amount;

            }

        }
    );


    const balance =
        totalIncome - totalExpense;


    incomeElement.textContent =
        formatCurrency(totalIncome);

    expenseElement.textContent =
        formatCurrency(totalExpense);

    balanceElement.textContent =
        formatCurrency(balance);

}


// ================================
// DISPLAY TRANSACTIONS
// ================================

function displayTransactions() {

    const searchText =
        searchInput.value.toLowerCase();

    const selectedType =
        filterType.value;

    const selectedCategory =
        filterCategory.value;


    let filteredTransactions =
        transactions.filter(
            function(transaction) {

                const matchesSearch =
                    transaction.name
                        .toLowerCase()
                        .includes(searchText);


                const matchesType =
                    selectedType === "all" ||
                    transaction.type === selectedType;


                const matchesCategory =
                    selectedCategory === "all" ||
                    transaction.category === selectedCategory;


                return (
                    matchesSearch &&
                    matchesType &&
                    matchesCategory
                );

            }
        );


    // Newest first
    filteredTransactions.sort(
        function(a, b) {

            return new Date(b.date) -
                   new Date(a.date);

        }
    );


    transactionList.innerHTML = "";


    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <div class="empty">
                <h3>No transactions found</h3>
                <p>Add a transaction to see it here.</p>
            </div>
        `;

        return;

    }


    filteredTransactions.forEach(
        function(transaction) {

            const item =
                document.createElement("div");

            item.className =
                "transaction-item";


            const icon =
                getCategoryIcon(
                    transaction.category
                );


            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            const amountClass =
                transaction.type;


            item.innerHTML = `

                <div class="transaction-left">

                    <div class="transaction-icon">
                        ${icon}
                    </div>

                    <div class="transaction-info">

                        <h4>
                            ${escapeHTML(transaction.name)}
                        </h4>

                        <p>
                            ${transaction.category}
                            •
                            ${formatDate(transaction.date)}
                        </p>

                        ${
                            transaction.description
                            ? `<p>${escapeHTML(transaction.description)}</p>`
                            : ""
                        }

                    </div>

                </div>


                <div class="transaction-right">

                    <span class="amount ${amountClass}">
                        ${sign}${formatCurrency(transaction.amount)}
                    </span>

                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})"
                    >
                        🗑️
                    </button>

                </div>

            `;


            transactionList.appendChild(item);

        }
    );

}


// ================================
// DELETE TRANSACTION
// ================================

function deleteTransaction(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmDelete) {
        return;
    }


    transactions =
        transactions.filter(
            function(transaction) {

                return transaction.id !== id;

            }
        );


    saveTransactions();

    updateApp();

}


// ================================
// CLEAR ALL
// ================================

clearAllBtn.addEventListener(
    "click",
    function() {

        if (transactions.length === 0) {

            alert("There are no transactions.");

            return;

        }


        const confirmClear =
            confirm(
                "Are you sure you want to delete ALL transactions?"
            );


        if (!confirmClear) {
            return;
        }


        transactions = [];

        saveTransactions();

        updateApp();

    }
);


// ================================
// SEARCH
// ================================

searchInput.addEventListener(
    "input",
    displayTransactions
);


// ================================
// FILTER TYPE
// ================================

filterType.addEventListener(
    "change",
    displayTransactions
);


// ================================
// FILTER CATEGORY
// ================================

filterCategory.addEventListener(
    "change",
    displayTransactions
);


// ================================
// FORMAT CURRENCY
// ================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR"
        }
    ).format(amount);

}


// ================================
// FORMAT DATE
// ================================

function formatDate(date) {

    const dateObject =
        new Date(date + "T00:00:00");


    return dateObject.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ================================
// CATEGORY ICON
// ================================

function getCategoryIcon(category) {

    const icons = {

        Food: "🍔",

        Transport: "🚗",

        Shopping: "🛍️",

        Education: "📚",

        Bills: "🏠",

        Entertainment: "🎮",

        Health: "💊",

        Salary: "💼",

        Other: "📦"

    };


    return icons[category] || "📦";

}


// ================================
// CREATE EXPENSE CHART
// ================================

function createChart() {

    chart.innerHTML = "";


    const expenses = {};


    transactions.forEach(
        function(transaction) {

            if (transaction.type !== "expense") {
                return;
            }


            if (!expenses[transaction.category]) {

                expenses[transaction.category] = 0;

            }


            expenses[transaction.category] +=
                transaction.amount;

        }
    );


    const categories =
        Object.keys(expenses);


    if (categories.length === 0) {

        chart.innerHTML = `
            <div class="empty">
                <p>No expense data available.</p>
            </div>
        `;

        return;

    }


    const maximum =
        Math.max(
            ...Object.values(expenses)
        );


    categories.forEach(
        function(category) {

            const amount =
                expenses[category];


            const percentage =
                (amount / maximum) * 100;


            const item =
                document.createElement("div");

            item.className =
                "chart-item";


            item.innerHTML = `

                <div class="chart-label">

                    <span>
                        ${getCategoryIcon(category)}
                        ${category}
                    </span>

                    <strong>
                        ${formatCurrency(amount)}
                    </strong>

                </div>


                <div class="bar-background">

                    <div
                        class="bar"
                        style="width: ${percentage}%"
                    >
                    </div>

                </div>

            `;


            chart.appendChild(item);

        }
    );

}


// ================================
// PREVENT HTML INJECTION
// ================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ================================
// START APP
// ================================

updateApp();