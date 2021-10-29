const credit = await Transactions.findAll({
    where: {
        user_id: user.id
    }
});

let allCredit = credit.map(e => {
    return e.dataValues.expense
});
console.log("🚀 ~ file: transactionsController.js ~ line 120 ~ postTransaction:async ~ allCredit", allCredit)

const sum = allCredit.reduce((a, b) => a + b)
console.log("🚀 ~ file: transactionsController.js ~ line 123 ~ postTransaction:async ~ sum", sum)

const newSafe = safe.amount - sum
console.log("🚀 ~ file: transactionsController.js ~ line 124 ~ postTransaction:async ~ newSafe", newSafe)

const updateSafe = await Safes.update({
    amount: newSafe
}, {
    where: {
        user_id: user.id
    }
})

const findLimit = await Transactions.findAll({
    where: {
        limit_id: body.limit_id
    }
})

let limitTransaction = findLimit.map(e => {
    return e.dataValues.expense
});

const sumLimitTransaction = limitTransaction.reduce((a, b) => a + b)

const newLimit = limit.limit - sumLimitTransaction
console.log("🚀 ~ file: transactionsController.js ~ line 147 ~ postTransaction:async ~ newLimit", newLimit)

if (newLimit < 0) {
    return res.status(201).json({
        message: 'Over limit ',
        data: newLimit
    })
}

const expense = await Transactions.findAll({
    where: { user_id: user.id, type: 'expense' },
    attributes: ['category_id', [sequelize.fn("sum", sequelize.col("expense")), "totalExpense"], ],
    group: ["category_id"],
});
console.log("🚀 ~ file: transactionsController.js ~ line 220 ~ getAllTransaction:async ~ expense", expense)
console.log(expense, "========")
    // if (expense.dataValues.totalExpense)